import * as PrismaPkg from '@prisma/client';

const PrismaClientCtor: any = (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;

export const prisma = new PrismaClientCtor();

export default prisma;