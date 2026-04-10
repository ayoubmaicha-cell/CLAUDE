import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, firstName, lastName } = req.body;

    if (!name || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const cabinet = await AuthService.registerCabinet({ name, email, password, firstName, lastName });
    res.status(201).json({ message: 'Cabinet créé avec succès', cabinetId: cabinet.id });
  } catch (error: any) {
    if (error.message === 'Cabinet already exists') {
      return res.status(409).json({ error: 'Un cabinet avec cet email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        cabinet: {
          select: { id: true, name: true, email: true, phone: true, address: true, city: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
