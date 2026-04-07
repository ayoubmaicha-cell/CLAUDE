import { PrismaClient, DeclarationType } from '@prisma/client';

const prisma = new PrismaClient();

export class DeclarationService {
  static async createDeclaration(data: {
    cabinetId: string;
    clientId: string;
    type: DeclarationType;
    year: number;
    quarter?: number;
    data?: Record<string, any>;
  }) {
    return await prisma.declaration.create({
      data: {
        cabinet: { connect: { id: data.cabinetId } },
        client: { connect: { id: data.clientId } },
        type: data.type,
        year: data.year,
        quarter: data.quarter,
        data: data.data || {},
      },
    });
  }

  static async updateDeclaration(id: string, data: Record<string, any>) {
    return await prisma.declaration.update({
      where: { id },
      data: {
        data: data,
        updatedAt: new Date(),
      },
    });
  }

  static async getDeclarationsByClient(clientId: string) {
    return await prisma.declaration.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDeclarationsByYear(cabinetId: string, year: number) {
    return await prisma.declaration.findMany({
      where: {
        cabinetId,
        year,
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async submitDeclaration(id: string) {
    return await prisma.declaration.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  static async calculateIS(data: any) {
    // IS calculation logic
    const taxableIncome = data.totalIncome - data.totalExpenses;
    const irRate = 0.20; // 20% in Morocco
    return Math.max(0, taxableIncome * irRate);
  }

  static async calculateIR(data: any) {
    // IR calculation logic
    const taxableIncome = data.totalIncome - data.deductions;
    const brackets = [
      { max: 25000, rate: 0 },
      { max: 50000, rate: 0.10 },
      { max: 100000, rate: 0.20 },
      { max: 150000, rate: 0.30 },
      { max: Infinity, rate: 0.38 },
    ];

    let tax = 0;
    let previousMax = 0;

    for (const bracket of brackets) {
      if (taxableIncome <= previousMax) break;
      const income = Math.min(taxableIncome, bracket.max) - previousMax;
      tax += income * bracket.rate;
      previousMax = bracket.max;
    }

    return Math.max(0, tax);
  }

  static async calculateTVA(data: any) {
    // TVA calculation logic
    const taxableAmount = data.sales - data.purchases;
    const tvaRate = data.tvaRate || 0.20; // 20% standard rate
    return Math.max(0, taxableAmount * tvaRate);
  }
}
