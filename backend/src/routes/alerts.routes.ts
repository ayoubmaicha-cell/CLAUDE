import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /alerts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { cabinetId: req.user!.cabinetId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /alerts/generate — auto-generate alerts based on obligations
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const cabinetId = req.user!.cabinetId;
    const now = new Date();
    const j3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const j7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // J-7 alerts
    const j7Obligations = await prisma.clientObligation.findMany({
      where: {
        client: { cabinetId },
        statut: 'A_FAIRE',
        dateEcheance: { gte: now, lte: j7 },
      },
      include: {
        obligation: { select: { libelle: true } },
        client: { select: { raisonSociale: true } },
      },
    });

    for (const ob of j7Obligations) {
      await prisma.alert.create({
        data: {
          type: 'ECHEANCE_J7',
          message: `Échéance dans 7j: ${ob.obligation.libelle} — ${ob.client.raisonSociale} (${ob.periode})`,
          clientId: ob.clientId,
          obligationId: ob.id,
          cabinetId,
        },
      });
    }

    // J-3 alerts
    const j3Obligations = await prisma.clientObligation.findMany({
      where: {
        client: { cabinetId },
        statut: 'A_FAIRE',
        dateEcheance: { gte: now, lte: j3 },
      },
      include: {
        obligation: { select: { libelle: true } },
        client: { select: { raisonSociale: true } },
      },
    });

    for (const ob of j3Obligations) {
      await prisma.alert.create({
        data: {
          type: 'ECHEANCE_J3',
          message: `URGENT — Échéance dans 3j: ${ob.obligation.libelle} — ${ob.client.raisonSociale}`,
          clientId: ob.clientId,
          obligationId: ob.id,
          cabinetId,
        },
      });
    }

    // Retard alerts
    const retardObligations = await prisma.clientObligation.findMany({
      where: { client: { cabinetId }, statut: 'EN_RETARD' },
      include: {
        obligation: { select: { libelle: true } },
        client: { select: { raisonSociale: true } },
      },
    });

    for (const ob of retardObligations) {
      await prisma.alert.create({
        data: {
          type: 'RETARD',
          message: `EN RETARD: ${ob.obligation.libelle} — ${ob.client.raisonSociale} (${ob.periode})`,
          clientId: ob.clientId,
          obligationId: ob.id,
          cabinetId,
        },
      });
    }

    res.json({ message: 'Alertes générées', count: j7Obligations.length + j3Obligations.length + retardObligations.length });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /alerts/:id/read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.alert.updateMany({
      where: { id: req.params.id, cabinetId: req.user!.cabinetId },
      data: { isRead: true },
    });
    res.json({ message: 'Alerte marquée comme lue' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /alerts/read-all
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.alert.updateMany({
      where: { cabinetId: req.user!.cabinetId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'Toutes les alertes marquées comme lues' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
