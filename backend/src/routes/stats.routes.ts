import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /stats/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const cabinetId = req.user!.cabinetId;
    const now = new Date();
    const j7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const j3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Auto-update retard
    await prisma.clientObligation.updateMany({
      where: {
        client: { cabinetId },
        statut: { in: ['A_FAIRE', 'EN_COURS'] },
        dateEcheance: { lt: now },
      },
      data: { statut: 'EN_RETARD' },
    });

    const [
      totalClients,
      clientsActifs,
      totalObligations,
      enRetard,
      aFaire,
      enCours,
      deposees,
      payees,
      echeancesJ7,
      echeancesJ3,
      repartitionCategorie,
      repartitionStatut,
      facturesImpayees,
      dossiersJuridiques,
      revenueTotal,
    ] = await Promise.all([
      prisma.client.count({ where: { cabinetId } }),
      prisma.client.count({ where: { cabinetId, status: 'ACTIF' } }),
      prisma.clientObligation.count({ where: { client: { cabinetId } } }),
      prisma.clientObligation.count({ where: { client: { cabinetId }, statut: 'EN_RETARD' } }),
      prisma.clientObligation.count({ where: { client: { cabinetId }, statut: 'A_FAIRE' } }),
      prisma.clientObligation.count({ where: { client: { cabinetId }, statut: 'EN_COURS' } }),
      prisma.clientObligation.count({ where: { client: { cabinetId }, statut: 'DEPOSE' } }),
      prisma.clientObligation.count({ where: { client: { cabinetId }, statut: 'PAYE' } }),
      prisma.clientObligation.count({
        where: { client: { cabinetId }, statut: 'A_FAIRE', dateEcheance: { gte: now, lte: j7 } },
      }),
      prisma.clientObligation.count({
        where: { client: { cabinetId }, statut: 'A_FAIRE', dateEcheance: { gte: now, lte: j3 } },
      }),
      prisma.clientObligation.groupBy({
        by: ['obligationRefId'],
        where: { client: { cabinetId } },
        _count: { _all: true },
      }),
      prisma.clientObligation.groupBy({
        by: ['statut'],
        where: { client: { cabinetId } },
        _count: { _all: true },
      }),
      prisma.invoice.count({ where: { cabinetId, statut: { in: ['EN_ATTENTE', 'EN_RETARD'] } } }),
      prisma.juridicalFile.count({ where: { client: { cabinetId }, statut: 'EN_COURS' } }),
      prisma.invoice.aggregate({
        where: { cabinetId, statut: 'PAYE' },
        _sum: { totalTTC: true },
      }),
    ]);

    // Top 5 clients with most retard obligations
    const clientsEnRetard = await prisma.client.findMany({
      where: {
        cabinetId,
        obligations: { some: { statut: 'EN_RETARD' } },
      },
      include: {
        _count: { select: { obligations: { where: { statut: 'EN_RETARD' } } } },
      },
      orderBy: { obligations: { _count: 'desc' } },
      take: 5,
    });

    // Upcoming deadlines J7
    const prochainesEcheances = await prisma.clientObligation.findMany({
      where: {
        client: { cabinetId },
        statut: 'A_FAIRE',
        dateEcheance: { gte: now, lte: j7 },
      },
      include: {
        obligation: { select: { libelle: true, categorie: true } },
        client: { select: { id: true, raisonSociale: true } },
      },
      orderBy: { dateEcheance: 'asc' },
      take: 10,
    });

    res.json({
      clients: { total: totalClients, actifs: clientsActifs },
      obligations: {
        total: totalObligations,
        enRetard,
        aFaire,
        enCours,
        deposees,
        payees,
        echeancesJ7,
        echeancesJ3,
      },
      repartitionStatut,
      factures: {
        impayees: facturesImpayees,
        revenus: revenueTotal._sum.totalTTC || 0,
      },
      dossiersJuridiques,
      clientsEnRetard,
      prochainesEcheances,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
