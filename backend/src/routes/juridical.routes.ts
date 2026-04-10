import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /juridical
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, type, statut } = req.query as any;
    const where: any = { client: { cabinetId: req.user!.cabinetId } };
    if (clientId) where.clientId = clientId;
    if (type) where.type = type;
    if (statut) where.statut = statut;

    const files = await prisma.juridicalFile.findMany({
      where,
      include: { client: { select: { id: true, raisonSociale: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /juridical
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, type, description, dateDepot, dateFinPrevue, tribunal, numero } = req.body;
    if (!clientId || !type) return res.status(400).json({ error: 'Client et type requis' });

    const client = await prisma.client.findFirst({
      where: { id: clientId, cabinetId: req.user!.cabinetId },
    });
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    const file = await prisma.juridicalFile.create({
      data: {
        clientId, type, description,
        dateDepot: dateDepot ? new Date(dateDepot) : null,
        dateFinPrevue: dateFinPrevue ? new Date(dateFinPrevue) : null,
        tribunal, numero,
      },
    });
    res.status(201).json({ file });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /juridical/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.juridicalFile.findFirst({
      where: { id: req.params.id, client: { cabinetId: req.user!.cabinetId } },
    });
    if (!existing) return res.status(404).json({ error: 'Dossier non trouvé' });

    const { statut, description, dateDepot, dateFinPrevue, tribunal, numero } = req.body;
    const file = await prisma.juridicalFile.update({
      where: { id: req.params.id },
      data: {
        statut,
        description,
        dateDepot: dateDepot ? new Date(dateDepot) : undefined,
        dateFinPrevue: dateFinPrevue ? new Date(dateFinPrevue) : undefined,
        tribunal,
        numero,
      },
    });
    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /juridical/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.juridicalFile.findFirst({
      where: { id: req.params.id, client: { cabinetId: req.user!.cabinetId } },
    });
    if (!existing) return res.status(404).json({ error: 'Dossier non trouvé' });

    await prisma.juridicalFile.delete({ where: { id: req.params.id } });
    res.json({ message: 'Dossier supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
