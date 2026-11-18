import { categoryDisplayName } from '@/lib/equipment-categories';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

/** Percent of the daily rate charged for each successive rental day. The last value repeats. */
export type RentalStaffel = readonly number[];

export const DEFAULT_RENTAL_STAFFEL: RentalStaffel = [100, 50, 25];

export function normalizeStaffel(percents: readonly number[] | null | undefined): number[] {
  if (!percents || percents.length === 0) return [...DEFAULT_RENTAL_STAFFEL];
  return percents.map((percent) => {
    if (!Number.isFinite(percent) || percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  });
}

/** Share of one daily rate for the whole period. 3 days at 100/50/25 = 1.75. */
export function staffelFactor(days: number, staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL): number {
  if (days <= 0) return 0;
  const steps = normalizeStaffel(staffel);
  let sum = 0;
  for (let day = 0; day < days; day += 1) {
    sum += steps[Math.min(day, steps.length - 1)];
  }
  return sum / 100;
}

export function chargesFullDailyRate(
  days: number,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): boolean {
  return days <= 0 || Math.abs(staffelFactor(days, staffel) - days) < 1e-9;
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 }).format(value)}%`;
}

export function formatStaffelRule(staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL): string {
  const steps = normalizeStaffel(staffel);
  if (steps.length === 1) {
    return `elke huurdag ${formatPercent(steps[0])} van de dagprijs`;
  }
  const specific = steps
    .slice(0, -1)
    .map((percent, index) => `dag ${index + 1} ${formatPercent(percent)}`);
  const last = steps[steps.length - 1];
  return `${specific.join(', ')}, elke volgende dag ${formatPercent(last)} van de dagprijs`;
}

/** Shown under the day count when the staffel is not a full day price per day. */
export function staffelDayNote(
  days: number,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): string | null {
  if (chargesFullDailyRate(days, staffel)) return null;
  return `${formatPercent(staffelFactor(days, staffel) * 100)} van dagprijs`;
}

export type LineDiscount = {
  discountType: DiscountType | null;
  discountValue: number | null;
};

export function lineTotal(
  quantity: number,
  dailyRate: number,
  rentalStart: Date,
  rentalEnd: Date,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  const days = rentalDays(rentalStart, rentalEnd);
  return quantity * dailyRate * staffelFactor(days, staffel);
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

export function formatDailyRate(rate: number): string {
  return rate === 0 ? 'Gratis' : formatEur(rate);
}

export function computeDiscountAmount(
  subtotal: number,
  discount: LineDiscount
): number {
  if (
    !discount.discountType ||
    discount.discountValue == null ||
    discount.discountValue <= 0 ||
    subtotal <= 0
  ) {
    return 0;
  }
  if (discount.discountType === 'PERCENTAGE') {
    const pct = Math.min(discount.discountValue, 100);
    return subtotal * (pct / 100);
  }
  return Math.min(discount.discountValue, subtotal);
}

export function formatDiscountLabel(discount: LineDiscount): string {
  if (
    !discount.discountType ||
    discount.discountValue == null ||
    discount.discountValue <= 0
  ) {
    return '';
  }
  if (discount.discountType === 'PERCENTAGE') {
    return `${discount.discountValue}%`;
  }
  return formatEur(discount.discountValue);
}

export type ProjectLineRecord = {
  id: string;
  quantity: number;
  rentalStart: Date;
  rentalEnd: Date;
  equipmentId: string | null;
  customName: string | null;
  customDailyRate: number | null;
  discountType: DiscountType | null;
  discountValue: number | null;
  category: {
    id: string;
    name: string;
    sortOrder: number;
  } | null;
  equipment: {
    id: string;
    name: string;
    dailyRate: number;
    stockQty: number | null;
    isExternalRental: boolean;
    category: {
      id: string;
      name: string;
      sortOrder: number;
    } | null;
  } | null;
};

/** @deprecated use ProjectLineRecord */
export type LineWithEquipment = ProjectLineRecord;

export function isCustomProjectLine(line: ProjectLineRecord): boolean {
  return line.customName != null && line.customName.trim() !== '';
}

export function isExternalRentalLine(line: ProjectLineRecord): boolean {
  return line.equipment?.isExternalRental === true;
}

export function externalRentalLines(lines: ProjectLineRecord[]): ProjectLineRecord[] {
  return lines.filter(isExternalRentalLine);
}

export function projectLineName(line: ProjectLineRecord): string {
  if (isCustomProjectLine(line)) return line.customName!.trim();
  return line.equipment?.name ?? 'Onbekend';
}

export function projectLineCategory(line: ProjectLineRecord): string | null {
  if (isCustomProjectLine(line)) {
    return line.category ? categoryDisplayName(line.category) : null;
  }
  return categoryDisplayName(line.equipment?.category);
}

export function projectLineDailyRate(line: ProjectLineRecord): number {
  if (isCustomProjectLine(line)) return line.customDailyRate ?? 0;
  return line.equipment?.dailyRate ?? 0;
}

export function lineGrossTotal(
  line: ProjectLineRecord,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return lineTotal(
    line.quantity,
    projectLineDailyRate(line),
    line.rentalStart,
    line.rentalEnd,
    staffel
  );
}

export function lineDiscountAmount(
  line: ProjectLineRecord,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return computeDiscountAmount(lineGrossTotal(line, staffel), line);
}

export function lineNetTotal(
  line: ProjectLineRecord,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return Math.max(0, lineGrossTotal(line, staffel) - lineDiscountAmount(line, staffel));
}

export function projectMaterialGrossTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return lines.reduce((sum, line) => sum + lineGrossTotal(line, staffel), 0);
}

export function projectLineDiscountTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return lines.reduce((sum, line) => sum + lineDiscountAmount(line, staffel), 0);
}

export function projectMaterialTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return lines.reduce((sum, line) => sum + lineNetTotal(line, staffel), 0);
}

export function projectExternalRentalGrossTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return externalRentalLines(lines).reduce((sum, line) => sum + lineGrossTotal(line, staffel), 0);
}

export function projectExternalRentalMaterialTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return externalRentalLines(lines).reduce((sum, line) => sum + lineNetTotal(line, staffel), 0);
}

export function projectOwnMaterialTotal(
  lines: ProjectLineRecord[],
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
): number {
  return Math.max(
    0,
    projectMaterialTotal(lines, staffel) - projectExternalRentalMaterialTotal(lines, staffel)
  );
}

export function lineBreakdown(
  line: ProjectLineRecord,
  staffel: RentalStaffel = DEFAULT_RENTAL_STAFFEL
) {
  const days = rentalDays(line.rentalStart, line.rentalEnd);
  const factor = staffelFactor(days, staffel);
  const gross = lineGrossTotal(line, staffel);
  const discount = lineDiscountAmount(line, staffel);
  const total = Math.max(0, gross - discount);
  return { days, factor, percent: factor * 100, gross, discount, total };
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
