import { Router, Response } from 'express';
import { PrismaClient, ObligationStatut } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── Référentiel des obligations ──────────────────────────────────────────────

// GET /obligations/refs  — liste du référentiel
router.get('/refs', async (req: AuthRequest, res: Response) => {
  try {
    const refs = await prisma.obligationRef.findMany({
      where: {
        OR: [{ cabinetId: null }, { cabinetId: req.user!.cabinetId }],
        isActive: true,
      },
      orderBy: [{ categorie: 'asc' }, { code: 'asc' }],
    });
    res.json({ refs });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /obligations/refs — créer une obligation personnalisée
router.post('/refs', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { code, libelle, categorie, periodicite, regleEcheance, regimesCibles, tvaCibles, baseLegale, description } = req.body;

    const ref = await prisma.obligationRef.create({
      data: {
        code, libelle, categorie, periodicite, regleEcheance,
        regimesCibles: regimesCibles || [],
        tvaCibles: tvaCibles || [],
        baseLegale, description,
        cabinetId: req.user!.cabinetId,
      },
    });
    res.status(201).json({ ref });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Code obligation déjà existant' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Obligations client ───────────────────────────────────────────────────────

// GET /obligations — liste des obligations avec filtres
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, statut, from, to, categorie } = req.query as any;

    const where: any = {
      client: { cabinetId: req.user!.cabinetId },
    };

    if (clientId) where.clientId = clientId;
    if (statut) where.statut = statut;
    if (from || to) {
      where.dateEcheance = {};
      if (from) where.dateEcheance.gte = new Date(from);
      if (to) where.dateEcheance.lte = new Date(to);
    }
    if (categorie) where.obligation = { categorie };

    // Auto-update retard status
    await prisma.clientObligation.updateMany({
      where: {
        client: { cabinetId: req.user!.cabinetId },
        statut: { in: ['A_FAIRE', 'EN_COURS'] },
        dateEcheance: { lt: new Date() },
      },
      data: { statut: ObligationStatut.EN_RETARD },
    });

    const obligations = await prisma.clientObligation.findMany({
      where,
      include: {
        obligation: true,
        client: { select: { id: true, raisonSociale: true, type: true } },
        responsable: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dateEcheance: 'asc' },
    });

    // Calculate joursRetard
    const now = new Date();
    const enriched = obligations.map((o) => ({
      ...o,
      joursRetard: o.statut === 'EN_RETARD'
        ? Math.floor((now.getTime() - o.dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));

    res.json({ obligations: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /obligations/calendar — view for calendar month
router.get('/calendar', async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query as any;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0, 23, 59, 59);

    const obligations = await prisma.clientObligation.findMany({
      where: {
        client: { cabinetId: req.user!.cabinetId },
        dateEcheance: { gte: from, lte: to },
      },
      include: {
        obligation: { select: { libelle: true, categorie: true, code: true } },
        client: { select: { id: true, raisonSociale: true } },
      },
      orderBy: { dateEcheance: 'asc' },
    });

    res.json({ obligations });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /obligations/:id — update status
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { statut, dateDepot, datePaiement, montant, reference, notes, responsableId } = req.body;

    const existing = await prisma.clientObligation.findFirst({
      where: { id: req.params.id, client: { cabinetId: req.user!.cabinetId } },
    });
    if (!existing) return res.status(404).json({ error: 'Obligation non trouvée' });

    const updated = await prisma.clientObligation.update({
      where: { id: req.params.id },
      data: {
        statut,
        dateDepot: dateDepot ? new Date(dateDepot) : undefined,
        datePaiement: datePaiement ? new Date(datePaiement) : undefined,
        montant,
        reference,
        notes,
        responsableId: responsableId || undefined,
      },
      include: { obligation: true, client: { select: { id: true, raisonSociale: true } } },
    });

    res.json({ obligation: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /obligations/generate/:clientId — regenerate obligations for a client
router.post('/generate/:clientId', async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.body;
    const targetYear = year || new Date().getFullYear();

    const client = await prisma.client.findFirst({
      where: { id: req.params.clientId, cabinetId: req.user!.cabinetId },
    });
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    const refs = await prisma.obligationRef.findMany({
      where: {
        isActive: true,
        OR: [{ cabinetId: null }, { cabinetId: req.user!.cabinetId }],
        regimesCibles: { has: client.regimeFiscal },
      },
    });

    let created = 0;
    for (const ref of refs) {
      const periods = getPeriodsForYear(ref.periodicite, targetYear);
      for (const { periode, dateEcheance } of periods) {
        const result = await prisma.clientObligation.upsert({
          where: { clientId_obligationRefId_periode: { clientId: client.id, obligationRefId: ref.id, periode } },
          create: { clientId: client.id, obligationRefId: ref.id, periode, dateEcheance },
          update: {},
        });
        created++;
      }
    }

    res.json({ message: `${created} obligations générées/synchronisées`, year: targetYear });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

function getPeriodsForYear(periodicite: string, year: number): { periode: string; dateEcheance: Date }[] {
  const result: { periode: string; dateEcheance: Date }[] = [];
  if (periodicite === 'MENSUELLE') {
    for (let m = 1; m <= 12; m++) {
      const periode = `${year}-${String(m).padStart(2, '0')}`;
      const dateEcheance = new Date(year, m, 20);
      result.push({ periode, dateEcheance });
    }
  } else if (periodicite === 'TRIMESTRIELLE') {
    for (let q = 1; q <= 4; q++) {
      const periode = `${year}-T${q}`;
      const endMonth = q * 3;
      const dateEcheance = new Date(year, endMonth, 20);
      result.push({ periode, dateEcheance });
    }
  } else if (periodicite === 'ANNUELLE') {
    result.push({ periode: `${year}`, dateEcheance: new Date(year + 1, 2, 31) });
  }
  return result;
}

export default router;
