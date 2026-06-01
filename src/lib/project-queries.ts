import { prisma } from '@/lib/db';
import { mapCrewShiftFromDb } from '@/lib/crew';
import type { CrewShiftInput } from '@/lib/crew';

export const projectInclude = {
  client: true,
  lines: {
    include: {
      equipment: { include: { category: true } },
    },
    orderBy: { rentalStart: 'asc' as const },
  },
  crewShifts: {
    include: {
      staffAssignments: { include: { staff: true } },
    },
    orderBy: [{ date: 'asc' as const }, { startTime: 'asc' as const }],
  },
};

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
}

import type { Prisma } from '@/generated/prisma/client';

export async function listProjects(status?: string, search?: string) {
  const q = search?.trim();
  const where: Prisma.ProjectWhereInput = {};
  if (status) {
    where.status = status as 'CONCEPT' | 'OFFERTE' | 'BEVESTIGD' | 'AFGEROND';
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { quoteNumber: { contains: q, mode: 'insensitive' } },
      { client: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  return prisma.project.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      client: true,
      lines: { include: { equipment: { include: { category: true } } } },
      crewShifts: {
        include: { staffAssignments: { include: { staff: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export function projectCrewShifts(
  project: NonNullable<Awaited<ReturnType<typeof getProjectById>>>
): CrewShiftInput[] {
  return project.crewShifts.map(mapCrewShiftFromDb);
}
