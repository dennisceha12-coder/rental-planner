export function lineTotal(
  quantity: number,
  dailyRate: number,
  rentalStart: Date,
  rentalEnd: Date
): number {
  const days = rentalDays(rentalStart, rentalEnd);
  return quantity * dailyRate * days;
}

export function rentalDays(start: Date, end: Date): number {
  const s = startOfDay(start);
  const e = startOfDay(end);
  if (e < s) return 0;
  const diff = e.getTime() - s.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export type ProjectLineRecord = {
  id: string;
  quantity: number;
  rentalStart: Date;
  rentalEnd: Date;
  equipmentId: string | null;
  customName: string | null;
  customDailyRate: number | null;
  equipment: {
    id: string;
    name: string;
    category: string | null;
    dailyRate: number;
    stockQty: number | null;
  } | null;
};

/** @deprecated use ProjectLineRecord */
export type LineWithEquipment = ProjectLineRecord;

export function isCustomProjectLine(line: ProjectLineRecord): boolean {
  return line.customName != null && line.customName.trim() !== '';
}

export function projectLineName(line: ProjectLineRecord): string {
  if (isCustomProjectLine(line)) return line.customName!.trim();
  return line.equipment?.name ?? 'Onbekend';
}

export function projectLineCategory(line: ProjectLineRecord): string | null {
  if (isCustomProjectLine(line)) return 'Tijdelijk';
  return line.equipment?.category ?? null;
}

export function projectLineDailyRate(line: ProjectLineRecord): number {
  if (isCustomProjectLine(line)) return line.customDailyRate ?? 0;
  return line.equipment?.dailyRate ?? 0;
}

export function projectMaterialTotal(lines: ProjectLineRecord[]): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      lineTotal(
        line.quantity,
        projectLineDailyRate(line),
        line.rentalStart,
        line.rentalEnd
      ),
    0
  );
}

export function lineBreakdown(line: ProjectLineRecord) {
  const days = rentalDays(line.rentalStart, line.rentalEnd);
  const total = lineTotal(
    line.quantity,
    projectLineDailyRate(line),
    line.rentalStart,
    line.rentalEnd
  );
  return { days, total };
}

/** Sum quantity per catalog item across lines (for stock warning). */
export function quantityUsedOnProject(
  lines: { equipmentId: string | null; quantity: number }[],
  equipmentId: string
): number {
  return lines
    .filter((l) => l.equipmentId === equipmentId)
    .reduce((sum, l) => sum + l.quantity, 0);
}
