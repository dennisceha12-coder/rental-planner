import { prisma } from '@/lib/db';

export const projectInclude = {
  client: true,
  lines: {
    include: { equipment: true },
    orderBy: { rentalStart: 'asc' as const },
  },
} as const;

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
}

export async function listProjects(status?: string) {
  return prisma.project.findMany({
    where: status ? { status: status as 'CONCEPT' | 'OFFERTE' | 'BEVESTIGD' | 'AFGEROND' } : undefined,
    include: {
      client: true,
      lines: { include: { equipment: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
