import { formatEur } from '@/lib/pricing';
import {
  computeProjectTotals,
  formatDiscountLabel,
  type ProjectCostFields,
} from '@/lib/project-totals';
import { crewPhaseSummaries } from '@/lib/crew';
import type { LineWithEquipment } from '@/lib/pricing';

export default function ProjectCostSummary({
  lines,
  costs,
}: {
  lines: LineWithEquipment[];
  costs: ProjectCostFields;
}) {
  const t = computeProjectTotals(lines, costs);
  const crewPhases = crewPhaseSummaries(costs.crewShifts, costs.hourlyRate);
  const hasExtras = t.labor > 0 || t.transport > 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
      <h3 className="mb-3 font-medium text-zinc-900">Prijsopbouw</h3>
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-600">Materiaal</dt>
          <dd className="tabular-nums font-medium">{formatEur(t.material)}</dd>
        </div>
        {crewPhases.map((p) => (
          <div key={p.phase} className="flex justify-between gap-4 text-zinc-600">
            <dt>
              Personeel {p.label.toLowerCase()}{' '}
              <span className="text-zinc-400">({p.manHours} manuur)</span>
            </dt>
            <dd className="tabular-nums">{formatEur(p.cost)}</dd>
          </div>
        ))}
        {t.transport > 0 && (
          <div className="flex justify-between gap-4 text-zinc-600">
            <dt>Transport</dt>
            <dd className="tabular-nums">{formatEur(t.transport)}</dd>
          </div>
        )}
        {t.discountAmount > 0 && (
          <div className="flex justify-between gap-4 text-zinc-600">
            <dt>Korting ({formatDiscountLabel(costs)})</dt>
            <dd className="tabular-nums text-red-700">−{formatEur(t.discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2">
          <dt className="font-semibold text-zinc-900">Totaal excl. BTW</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatEur(t.grandTotal)}</dd>
        </div>
      </dl>
      {!hasExtras && t.material === 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Voeg materiaal, personeelsplanning of transport toe.
        </p>
      )}
    </div>
  );
}
