import { prisma } from '@/lib/db';
import { mapCrewShiftFromDb } from '@/lib/crew';
import type { CrewShiftInput } from '@/lib/crew';

export const projectInclude = {
  client: true,
  lines: {
    include: { equipment: true },
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

export async function listProjects(status?: string) {
  return prisma.project.findMany({
    where: status ? { status: status as 'CONCEPT' | 'OFFERTE' | 'BEVESTIGD' | 'AFGEROND' } : undefined,
    include: {
      client: true,
      lines: { include: { equipment: true } },
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
