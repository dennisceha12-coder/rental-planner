import { categoryDisplayName } from '@/lib/equipment-categories';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export type LineDiscount = {
  discountType: DiscountType | null;
  discountValue: number | null;
};

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

export function lineGrossTotal(line: ProjectLineRecord): number {
  return lineTotal(
    line.quantity,
    projectLineDailyRate(line),
    line.rentalStart,
    line.rentalEnd
  );
}

export function lineDiscountAmount(line: ProjectLineRecord): number {
  return computeDiscountAmount(lineGrossTotal(line), line);
}

export function lineNetTotal(line: ProjectLineRecord): number {
  return Math.max(0, lineGrossTotal(line) - lineDiscountAmount(line));
}

export function projectMaterialGrossTotal(lines: ProjectLineRecord[]): number {
  return lines.reduce((sum, line) => sum + lineGrossTotal(line), 0);
}

export function projectLineDiscountTotal(lines: ProjectLineRecord[]): number {
  return lines.reduce((sum, line) => sum + lineDiscountAmount(line), 0);
}

export function projectMaterialTotal(lines: ProjectLineRecord[]): number {
  return lines.reduce((sum, line) => sum + lineNetTotal(line), 0);
}

export function projectExternalRentalGrossTotal(lines: ProjectLineRecord[]): number {
  return externalRentalLines(lines).reduce((sum, line) => sum + lineGrossTotal(line), 0);
}

export function projectExternalRentalMaterialTotal(lines: ProjectLineRecord[]): number {
  return externalRentalLines(lines).reduce((sum, line) => sum + lineNetTotal(line), 0);
}

export function projectOwnMaterialTotal(lines: ProjectLineRecord[]): number {
  return Math.max(0, projectMaterialTotal(lines) - projectExternalRentalMaterialTotal(lines));
}

export function lineBreakdown(line: ProjectLineRecord) {
  const days = rentalDays(line.rentalStart, line.rentalEnd);
  const gross = lineGrossTotal(line);
  const discount = lineDiscountAmount(line);
  const total = Math.max(0, gross - discount);
  return { days, gross, discount, total };
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
