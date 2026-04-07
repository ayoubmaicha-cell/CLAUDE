import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  static async registerCabinet(data: {
    name: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    // Check if cabinet exists
    const existingCabinet = await prisma.cabinet.findUnique({
      where: { email: data.email },
    });

    if (existingCabinet) {
      throw new Error('Cabinet already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create cabinet and user
    const cabinet = await prisma.cabinet.create({
      data: {
        name: data.name,
        email: data.email,
        users: {
          create: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'ADMIN',
          },
        },
      },
      include: {
        users: true,
      },
    });

    return cabinet;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { cabinet: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        cabinetId: user.cabinetId,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        cabinet: user.cabinet,
      },
    };
  }
}
