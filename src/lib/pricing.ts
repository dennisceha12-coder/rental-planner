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

export function lineTotal(
  quantity: number,
  dailyRate: number,
  rentalStart: Date,
  rentalEnd: Date
): number {
  const days = rentalDays(rentalStart, rentalEnd);
  return quantity * dailyRate * days;
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export type LineWithEquipment = {
  id: string;
  quantity: number;
  rentalStart: Date;
  rentalEnd: Date;
  equipment: {
    id: string;
    name: string;
    category: string | null;
    dailyRate: number;
    stockQty: number | null;
  };
};

export function projectMaterialTotal(lines: LineWithEquipment[]): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      lineTotal(
        line.quantity,
        line.equipment.dailyRate,
        line.rentalStart,
        line.rentalEnd
      ),
    0
  );
}

export function lineBreakdown(line: LineWithEquipment) {
  const days = rentalDays(line.rentalStart, line.rentalEnd);
  const total = lineTotal(
    line.quantity,
    line.equipment.dailyRate,
    line.rentalStart,
    line.rentalEnd
  );
  return { days, total };
}

/** Sum quantity per equipment across all lines in a project (for stock warning). */
export function quantityUsedOnProject(
  lines: { equipmentId: string; quantity: number }[],
  equipmentId: string
): number {
  return lines
    .filter((l) => l.equipmentId === equipmentId)
    .reduce((sum, l) => sum + l.quantity, 0);
}
