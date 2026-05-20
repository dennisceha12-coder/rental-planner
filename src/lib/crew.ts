import type { CrewPhase } from '@/generated/prisma/client';

export const CREW_PHASE_LABELS: Record<CrewPhase, string> = {
  OPBOUW: 'Opbouw',
  SHOW: 'Show',
  AFBOUW: 'Afbouw',
};

export type CrewShiftInput = {
  id: string;
  phase: CrewPhase;
  role: string | null;
  headcount: number;
  date: Date;
  startTime: string;
  endTime: string;
  hourlyRate: number | null;
  staffNames: string[];
};

export function effectiveHeadcount(shift: Pick<CrewShiftInput, 'headcount' | 'staffNames'>): number {
  if (shift.staffNames.length > 0) {
    return Math.max(shift.headcount, shift.staffNames.length);
  }
  return shift.headcount;
}

/** Duration in hours between HH:MM times (same day; overnight adds 24h). */
export function shiftDurationHours(startTime: string, endTime: string): number {
  const start = parseTimeMinutes(startTime);
  const end = parseTimeMinutes(endTime);
  if (start == null || end == null) return 0;
  let diff = end - start;
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

function parseTimeMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function shiftManHours(shift: Pick<CrewShiftInput, 'headcount' | 'startTime' | 'endTime' | 'staffNames'>): number {
  return effectiveHeadcount(shift) * shiftDurationHours(shift.startTime, shift.endTime);
}

export function shiftCost(
  shift: Pick<CrewShiftInput, 'headcount' | 'startTime' | 'endTime' | 'hourlyRate' | 'staffNames'>,
  defaultHourlyRate: number | null
): number {
  const rate = shift.hourlyRate ?? defaultHourlyRate ?? 0;
  if (rate <= 0) return 0;
  return shiftManHours(shift) * rate;
}

export function crewTotalCost(
  shifts: CrewShiftInput[],
  defaultHourlyRate: number | null
): number {
  return shifts.reduce((sum, s) => sum + shiftCost(s, defaultHourlyRate), 0);
}

export function crewCostByPhase(
  shifts: CrewShiftInput[],
  defaultHourlyRate: number | null
): Record<CrewPhase, number> {
  const out: Record<CrewPhase, number> = { OPBOUW: 0, SHOW: 0, AFBOUW: 0 };
  for (const s of shifts) {
    out[s.phase] += shiftCost(s, defaultHourlyRate);
  }
  return out;
}

export type CrewPhaseSummary = {
  phase: CrewPhase;
  label: string;
  manHours: number;
  cost: number;
  avgRate: number;
  shifts: CrewShiftInput[];
};

export function crewPhaseSummaries(
  shifts: CrewShiftInput[],
  defaultHourlyRate: number | null
): CrewPhaseSummary[] {
  const phases: CrewPhase[] = ['OPBOUW', 'SHOW', 'AFBOUW'];
  return phases
    .map((phase) => {
      const phaseShifts = shifts.filter((s) => s.phase === phase);
      if (phaseShifts.length === 0) return null;
      const manHours = phaseShifts.reduce((sum, s) => sum + shiftManHours(s), 0);
      const cost = phaseShifts.reduce((sum, s) => sum + shiftCost(s, defaultHourlyRate), 0);
      return {
        phase,
        label: CREW_PHASE_LABELS[phase],
        manHours,
        cost,
        avgRate: manHours > 0 ? cost / manHours : 0,
        shifts: phaseShifts,
      };
    })
    .filter(Boolean) as CrewPhaseSummary[];
}

export function formatStaffLabel(shift: Pick<CrewShiftInput, 'headcount' | 'staffNames'>): string {
  if (shift.staffNames.length > 0) return shift.staffNames.join(', ');
  return `${effectiveHeadcount(shift)} personen`;
}

export function mapCrewShiftFromDb(shift: {
  id: string;
  phase: CrewPhase;
  role: string | null;
  headcount: number;
  date: Date;
  startTime: string;
  endTime: string;
  hourlyRate: number | null;
  staffAssignments?: { staff: { name: string } }[];
}): CrewShiftInput {
  return {
    id: shift.id,
    phase: shift.phase,
    role: shift.role,
    headcount: shift.headcount,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    hourlyRate: shift.hourlyRate,
    staffNames: shift.staffAssignments?.map((a) => a.staff.name) ?? [],
  };
}

export function parseStaffIds(raw: FormDataEntryValue | null): string[] {
  if (!raw || String(raw).trim() === '') return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
