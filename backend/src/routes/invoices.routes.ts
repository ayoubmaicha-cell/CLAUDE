import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, statut } = req.query as any;
    const where: any = { cabinetId: req.user!.cabinetId };
    if (clientId) where.clientId = clientId;
    if (statut) where.statut = statut;

    // Auto-mark overdue invoices
    await prisma.invoice.updateMany({
      where: {
        cabinetId: req.user!.cabinetId,
        statut: 'EN_ATTENTE',
        dateEcheance: { lt: new Date() },
      },
      data: { statut: 'EN_RETARD' },
    });

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: { select: { id: true, raisonSociale: true } } },
      orderBy: { dateEmission: 'desc' },
    });
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /invoices
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, montant, tva, dateEcheance, description } = req.body;
    if (!clientId || !montant || !dateEcheance) {
      return res.status(400).json({ error: 'Client, montant et date d\'échéance requis' });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, cabinetId: req.user!.cabinetId },
    });
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    const count = await prisma.invoice.count({ where: { cabinetId: req.user!.cabinetId } });
    const numero = `FACT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const tvaRate = tva ?? 0.20;
    const totalTTC = montant * (1 + tvaRate);

    const invoice = await prisma.invoice.create({
      data: {
        numero,
        montant,
        tva: tvaRate,
        totalTTC,
        dateEcheance: new Date(dateEcheance),
        description,
        clientId,
        cabinetId: req.user!.cabinetId,
      },
      include: { client: { select: { id: true, raisonSociale: true } } },
    });

    res.status(201).json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /invoices/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
    });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });

    const { statut, datePaiement } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        statut,
        datePaiement: datePaiement ? new Date(datePaiement) : undefined,
      },
    });
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /invoices/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
    });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });

    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
