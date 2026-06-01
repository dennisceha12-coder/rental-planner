import {
  lineTotal,
  projectMaterialTotal,
  type LineWithEquipment,
} from '@/lib/pricing';
import {
  crewCostByPhase,
  crewPhaseSummaries,
  crewTotalCost,
  mapCrewShiftFromDb,
  effectiveHeadcount,
  type CrewShiftInput,
} from '@/lib/crew';
import type { CrewPhase } from '@/generated/prisma/client';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export type ProjectDiscount = {
  discountType: DiscountType | null;
  discountValue: number | null;
};

export type ProjectCostFields = {
  hourlyRate: number | null;
  transportKm: number | null;
  transportRatePerKm: number | null;
  crewShifts: CrewShiftInput[];
} & ProjectDiscount;

export type ProjectTotals = {
  material: number;
  laborByPhase: Record<CrewPhase, number>;
  labor: number;
  transport: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  grandTotal: number;
};

export function computeDiscountAmount(
  subtotal: number,
  discount: ProjectDiscount
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

export function formatDiscountLabel(discount: ProjectDiscount): string {
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
  return 'vast bedrag';
}

export function transportTotal(
  km: number | null,
  ratePerKm: number | null
): number {
  if (km == null || km <= 0 || ratePerKm == null || ratePerKm <= 0) return 0;
  return km * ratePerKm;
}

export function computeProjectTotals(
  lines: LineWithEquipment[],
  costs: ProjectCostFields
): ProjectTotals {
  const material = projectMaterialTotal(lines);
  const laborByPhase = crewCostByPhase(costs.crewShifts, costs.hourlyRate);
  const labor = crewTotalCost(costs.crewShifts, costs.hourlyRate);
  const transport = transportTotal(costs.transportKm, costs.transportRatePerKm);
  const subtotalBeforeDiscount = material + labor + transport;
  const discountAmount = computeDiscountAmount(subtotalBeforeDiscount, costs);
  return {
    material,
    laborByPhase,
    labor,
    transport,
    subtotalBeforeDiscount,
    discountAmount,
    grandTotal: Math.max(0, subtotalBeforeDiscount - discountAmount),
  };
}

export type QuoteExtraLine = {
  key: string;
  label: string;
  quantity: number;
  unit: string;
  unitRate: number;
  total: number;
  detail?: string;
};

export function quoteCrewLines(
  shifts: CrewShiftInput[],
  defaultHourlyRate: number | null
): QuoteExtraLine[] {
  return crewPhaseSummaries(shifts, defaultHourlyRate).map((summary) => ({
    key: summary.phase,
    label: `Personeel ${summary.label.toLowerCase()}`,
    quantity: summary.manHours,
    unit: 'manuur',
    unitRate: summary.avgRate,
    total: summary.cost,
    detail: summary.shifts
      .map((s) => {
        const role = s.role?.trim() || summary.label;
        const names =
          s.staffNames.length > 0 ? ` (${s.staffNames.join(', ')})` : '';
        return `${role}: ${effectiveHeadcount(s)}× ${s.startTime}–${s.endTime}${names}`;
      })
      .join('; '),
  }));
}

export function quoteExtraLines(costs: ProjectCostFields): QuoteExtraLine[] {
  const lines = quoteCrewLines(costs.crewShifts, costs.hourlyRate);
  if (
    costs.transportKm != null &&
    costs.transportKm > 0 &&
    costs.transportRatePerKm != null &&
    costs.transportRatePerKm > 0
  ) {
    lines.push({
      key: 'transport',
      label: 'Transport',
      quantity: costs.transportKm,
      unit: 'km',
      unitRate: costs.transportRatePerKm,
      total: transportTotal(costs.transportKm, costs.transportRatePerKm),
    });
  }
  return lines;
}

export function projectToCostFields(project: {
  hourlyRate: number | null;
  transportKm: number | null;
  transportRatePerKm: number | null;
  discountType: DiscountType | null;
  discountValue: number | null;
  crewShifts: Parameters<typeof mapCrewShiftFromDb>[0][];
}): ProjectCostFields {
  return {
    hourlyRate: project.hourlyRate,
    transportKm: project.transportKm,
    transportRatePerKm: project.transportRatePerKm,
    discountType: project.discountType,
    discountValue: project.discountValue,
    crewShifts: project.crewShifts.map(mapCrewShiftFromDb),
  };
}

/** Re-export for convenience */
export { lineTotal, projectMaterialTotal, formatEur, lineBreakdown } from '@/lib/pricing';
