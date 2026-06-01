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
import type { CrewPhase, TransportType } from '@/generated/prisma/client';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export type ProjectDiscount = {
  discountType: DiscountType | null;
  discountValue: number | null;
};

export type ProjectTransport = {
  transportType: TransportType;
  transportKm: number | null;
  transportRatePerKm: number | null;
  transportFixedAmount: number | null;
};

export type ProjectCostFields = {
  hourlyRate: number | null;
  crewShifts: CrewShiftInput[];
} & ProjectDiscount &
  ProjectTransport;

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

export function transportTotal(transport: ProjectTransport): number {
  if (transport.transportType === 'FIXED') {
    if (
      transport.transportFixedAmount == null ||
      transport.transportFixedAmount <= 0
    ) {
      return 0;
    }
    return transport.transportFixedAmount;
  }
  if (
    transport.transportKm == null ||
    transport.transportKm <= 0 ||
    transport.transportRatePerKm == null ||
    transport.transportRatePerKm <= 0
  ) {
    return 0;
  }
  return transport.transportKm * transport.transportRatePerKm;
}

export function formatTransportLabel(transport: ProjectTransport): string {
  if (transport.transportType === 'FIXED') {
    return 'vast tarief';
  }
  if (
    transport.transportKm != null &&
    transport.transportKm > 0 &&
    transport.transportRatePerKm != null &&
    transport.transportRatePerKm > 0
  ) {
    return `${transport.transportKm} km × €${transport.transportRatePerKm.toFixed(2)}`;
  }
  return '';
}

export function computeProjectTotals(
  lines: LineWithEquipment[],
  costs: ProjectCostFields
): ProjectTotals {
  const material = projectMaterialTotal(lines);
  const laborByPhase = crewCostByPhase(costs.crewShifts, costs.hourlyRate);
  const labor = crewTotalCost(costs.crewShifts, costs.hourlyRate);
  const transport = transportTotal(costs);
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
  const transportAmount = transportTotal(costs);

  if (transportAmount > 0) {
    if (costs.transportType === 'FIXED') {
      lines.push({
        key: 'transport',
        label: 'Transport',
        quantity: 1,
        unit: 'vast',
        unitRate: transportAmount,
        total: transportAmount,
      });
    } else {
      lines.push({
        key: 'transport',
        label: 'Transport',
        quantity: costs.transportKm!,
        unit: 'km',
        unitRate: costs.transportRatePerKm!,
        total: transportAmount,
      });
    }
  }
  return lines;
}

export function projectToCostFields(project: {
  hourlyRate: number | null;
  transportType: TransportType;
  transportKm: number | null;
  transportRatePerKm: number | null;
  transportFixedAmount: number | null;
  discountType: DiscountType | null;
  discountValue: number | null;
  crewShifts: Parameters<typeof mapCrewShiftFromDb>[0][];
}): ProjectCostFields {
  return {
    hourlyRate: project.hourlyRate,
    transportType: project.transportType,
    transportKm: project.transportKm,
    transportRatePerKm: project.transportRatePerKm,
    transportFixedAmount: project.transportFixedAmount,
    discountType: project.discountType,
    discountValue: project.discountValue,
    crewShifts: project.crewShifts.map(mapCrewShiftFromDb),
  };
}

/** Re-export for convenience */
export { lineTotal, projectMaterialTotal, formatEur, lineBreakdown } from '@/lib/pricing';
