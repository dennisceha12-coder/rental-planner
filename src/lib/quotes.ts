import { prisma } from '@/lib/db';

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OFF-${year}-`;
  const count = await prisma.project.count({
    where: { quoteNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}
