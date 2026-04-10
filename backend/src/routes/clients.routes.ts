import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /clients
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, regimeFiscal, search } = req.query as any;
    const where: any = { cabinetId: req.user!.cabinetId };

    if (status) where.status = status;
    if (type) where.type = type;
    if (regimeFiscal) where.regimeFiscal = regimeFiscal;
    if (search) {
      where.OR = [
        { raisonSociale: { contains: search, mode: 'insensitive' } },
        { if_number: { contains: search } },
        { ice: { contains: search } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        responsable: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { obligations: true } },
      },
      orderBy: { raisonSociale: 'asc' },
    });

    res.json({ clients });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /clients/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
      include: {
        responsable: { select: { id: true, firstName: true, lastName: true } },
        obligations: {
          include: { obligation: true },
          orderBy: { dateEcheance: 'asc' },
        },
        juridicalFiles: true,
        invoices: { orderBy: { dateEmission: 'desc' } },
      },
    });

    if (!client) return res.status(404).json({ error: 'Client non trouvé' });
    res.json({ client });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /clients
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      raisonSociale, type, if_number, ice, rc, cnss, patente,
      email, phone, address, city, regimeFiscal, regimeTVA,
      dateDebutActivite, responsableId,
    } = req.body;

    if (!raisonSociale || !type || !regimeFiscal) {
      return res.status(400).json({ error: 'Raison sociale, type et régime fiscal sont requis' });
    }

    const client = await prisma.client.create({
      data: {
        raisonSociale, type, if_number, ice, rc, cnss, patente,
        email, phone, address, city, regimeFiscal,
        regimeTVA: regimeTVA || 'EXONERE',
        dateDebutActivite: dateDebutActivite ? new Date(dateDebutActivite) : null,
        cabinetId: req.user!.cabinetId,
        responsableId: responsableId || null,
      },
    });

    // Generate obligations automatically after client creation
    await generateClientObligations(client.id, req.user!.cabinetId);

    res.status(201).json({ client });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /clients/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
    });
    if (!existing) return res.status(404).json({ error: 'Client non trouvé' });

    const {
      raisonSociale, type, if_number, ice, rc, cnss, patente,
      email, phone, address, city, regimeFiscal, regimeTVA,
      dateDebutActivite, responsableId, status,
    } = req.body;

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        raisonSociale, type, if_number, ice, rc, cnss, patente,
        email, phone, address, city, regimeFiscal, regimeTVA,
        status,
        dateDebutActivite: dateDebutActivite ? new Date(dateDebutActivite) : undefined,
        responsableId: responsableId || null,
      },
    });

    res.json({ client });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /clients/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
    });
    if (!existing) return res.status(404).json({ error: 'Client non trouvé' });

    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Helper: generate obligations for a newly created client
async function generateClientObligations(clientId: string, cabinetId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;

  const refs = await prisma.obligationRef.findMany({
    where: {
      isActive: true,
      OR: [{ cabinetId: null }, { cabinetId }],
      regimesCibles: { has: client.regimeFiscal },
    },
  });

  const now = new Date();
  const year = now.getFullYear();

  for (const ref of refs) {
    const periods = getPeriodsForYear(ref.periodicite, year);
    for (const { periode, dateEcheance } of periods) {
      await prisma.clientObligation.upsert({
        where: { clientId_obligationRefId_periode: { clientId, obligationRefId: ref.id, periode } },
        create: { clientId, obligationRefId: ref.id, periode, dateEcheance },
        update: {},
      });
    }
  }
}

function getPeriodsForYear(periodicite: string, year: number): { periode: string; dateEcheance: Date }[] {
  const result: { periode: string; dateEcheance: Date }[] = [];

  if (periodicite === 'MENSUELLE') {
    for (let m = 1; m <= 12; m++) {
      const periode = `${year}-${String(m).padStart(2, '0')}`;
      const dateEcheance = new Date(year, m, 20); // 20 du mois suivant
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
    const periode = `${year}`;
    const dateEcheance = new Date(year + 1, 2, 31); // 31 mars N+1
    result.push({ periode, dateEcheance });
  }

  return result;
}

export default router;
