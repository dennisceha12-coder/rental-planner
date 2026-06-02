import {
  lineTotal,
  projectMaterialTotal,
  projectMaterialGrossTotal,
  projectLineDiscountTotal,
  projectExternalRentalMaterialTotal,
  projectExternalRentalGrossTotal,
  projectOwnMaterialTotal,
  externalRentalLines,
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

export type ProjectTransport = {
  transportType: TransportType;
  transportKm: number | null;
  transportRatePerKm: number | null;
  transportFixedAmount: number | null;
};

export type ProjectCostFields = {
  hourlyRate: number | null;
  totalDiscountAmount: number | null;
  crewShifts: CrewShiftInput[];
} & ProjectTransport;

export type ProjectTotals = {
  materialGross: number;
  lineDiscountTotal: number;
  material: number;
  externalRentalMaterial: number;
  externalRentalMaterialGross: number;
  externalRentalLineCount: number;
  ownMaterial: number;
  laborByPhase: Record<CrewPhase, number>;
  labor: number;
  transport: number;
  subtotalBeforeTotalDiscount: number;
  totalDiscountAmount: number;
  grandTotal: number;
};

export function computeTotalDiscountAmount(
  subtotal: number,
  amount: number | null | undefined
): number {
  if (amount == null || amount <= 0 || subtotal <= 0) {
    return 0;
  }
  return Math.min(amount, subtotal);
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
  const materialGross = projectMaterialGrossTotal(lines);
  const lineDiscountTotal = projectLineDiscountTotal(lines);
  const material = projectMaterialTotal(lines);
  const externalRentalMaterial = projectExternalRentalMaterialTotal(lines);
  const externalRentalMaterialGross = projectExternalRentalGrossTotal(lines);
  const externalRentalLineCount = externalRentalLines(lines).length;
  const ownMaterial = projectOwnMaterialTotal(lines);
  const laborByPhase = crewCostByPhase(costs.crewShifts, costs.hourlyRate);
  const labor = crewTotalCost(costs.crewShifts, costs.hourlyRate);
  const transport = transportTotal(costs);
  const subtotalBeforeTotalDiscount = material + labor + transport;
  const totalDiscountAmount = computeTotalDiscountAmount(
    subtotalBeforeTotalDiscount,
    costs.totalDiscountAmount
  );
  return {
    materialGross,
    lineDiscountTotal,
    material,
    externalRentalMaterial,
    externalRentalMaterialGross,
    externalRentalLineCount,
    ownMaterial,
    laborByPhase,
    labor,
    transport,
    subtotalBeforeTotalDiscount,
    totalDiscountAmount,
    grandTotal: Math.max(0, subtotalBeforeTotalDiscount - totalDiscountAmount),
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
  totalDiscountAmount: number | null;
  crewShifts: Parameters<typeof mapCrewShiftFromDb>[0][];
}): ProjectCostFields {
  return {
    hourlyRate: project.hourlyRate,
    transportType: project.transportType,
    transportKm: project.transportKm,
    transportRatePerKm: project.transportRatePerKm,
    transportFixedAmount: project.transportFixedAmount,
    totalDiscountAmount: project.totalDiscountAmount,
    crewShifts: project.crewShifts.map(mapCrewShiftFromDb),
  };
}

/** Re-export for convenience */
export {
  lineTotal,
  projectMaterialTotal,
  formatEur,
  lineBreakdown,
  formatDiscountLabel,
} from '@/lib/pricing';
