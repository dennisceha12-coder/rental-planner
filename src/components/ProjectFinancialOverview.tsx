'use client';

import Link from 'next/link';
import { useTransition, useState } from 'react';
import { updateProjectFinancial } from '@/app/actions';
import { formatEur } from '@/lib/pricing';
import { computeVatTotals } from '@/lib/vat';
import {
  computeProjectTotals,
  formatTransportLabel,
  type ProjectCostFields,
} from '@/lib/project-totals';
import { crewPhaseSummaries } from '@/lib/crew';
import FormErrors from '@/components/FormErrors';
import type { FieldErrors } from '@/lib/form-errors';
import type { LineWithEquipment } from '@/lib/pricing';

export default function ProjectFinancialOverview({
  projectId,
  lines,
  costs,
  defaultVatRate,
}: {
  projectId: string;
  lines: LineWithEquipment[];
  costs: ProjectCostFields;
  defaultVatRate: number;
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const t = computeProjectTotals(lines, costs);
  const vat = computeVatTotals(t.grandTotal, defaultVatRate);
  const crewPhases = crewPhaseSummaries(costs.crewShifts, costs.hourlyRate);
  const transportLabel = formatTransportLabel(costs);

  const submitTotalDiscount = (fd: FormData) => {
    startTransition(() => {
      void (async () => {
        const result = await updateProjectFinancial(fd);
        if (result?.error) {
          setErrors(result.error);
          return;
        }
        setErrors(undefined);
      })();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Financieel overzicht</h2>
          <Link
            href={`/print/${projectId}/offerte`}
            className="text-sm text-zinc-600 underline hover:text-zinc-900"
            target="_blank"
          >
            Offerte bekijken
          </Link>
        </div>
        <dl className="space-y-1.5">
          {t.materialGross > 0 && t.lineDiscountTotal > 0 && (
            <>
              <div className="flex justify-between gap-4 text-zinc-600">
                <dt>Materiaal (bruto)</dt>
                <dd className="tabular-nums">{formatEur(t.materialGross)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-zinc-600">
                <dt>Korting materiaalregels</dt>
                <dd className="tabular-nums text-red-700">−{formatEur(t.lineDiscountTotal)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600">Materiaal</dt>
            <dd className="tabular-nums font-medium">{formatEur(t.material)}</dd>
          </div>
          {t.externalRentalLineCount > 0 && (
            <div className="ml-3 space-y-1 border-l-2 border-amber-200 pl-3">
              <div className="flex justify-between gap-4 text-zinc-600">
                <dt>
                  Waarvan ingehuurd
                  <span className="text-zinc-400">
                    {' '}
                    ({t.externalRentalLineCount}{' '}
                    {t.externalRentalLineCount === 1 ? 'regel' : 'regels'})
                  </span>
                </dt>
                <dd className="tabular-nums font-medium text-amber-900">
                  {formatEur(t.externalRentalMaterial)}
                </dd>
              </div>
              {t.externalRentalMaterialGross > t.externalRentalMaterial && (
                <div className="flex justify-between gap-4 text-xs text-zinc-500">
                  <dt>Bruto ingehuur</dt>
                  <dd className="tabular-nums">{formatEur(t.externalRentalMaterialGross)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 text-xs text-zinc-500">
                <dt>Eigen materiaal</dt>
                <dd className="tabular-nums">{formatEur(t.ownMaterial)}</dd>
              </div>
            </div>
          )}
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
              <dt>
                Transport
                {transportLabel && (
                  <span className="text-zinc-400"> ({transportLabel})</span>
                )}
              </dt>
              <dd className="tabular-nums">{formatEur(t.transport)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-zinc-100 pt-2">
            <dt className="text-zinc-600">Subtotaal</dt>
            <dd className="tabular-nums font-medium">
              {formatEur(t.subtotalBeforeTotalDiscount)}
            </dd>
          </div>
          {t.totalDiscountAmount > 0 && (
            <div className="flex justify-between gap-4 text-zinc-600">
              <dt>Korting op totaal</dt>
              <dd className="tabular-nums text-red-700">−{formatEur(t.totalDiscountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2">
            <dt className="font-semibold text-zinc-900">Totaal excl. BTW</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEur(t.grandTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-zinc-600">
            <dt>BTW ({vat.vatRatePercent}%)</dt>
            <dd className="tabular-nums">{formatEur(vat.vatAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2">
            <dt className="font-semibold text-zinc-900">Totaal incl. BTW</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEur(vat.totalInclVat)}</dd>
          </div>
        </dl>
        {t.externalRentalLineCount > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            Ingehuurd materiaal is je interne kostenpost (catalogusregels met &quot;Extern
            inhuur&quot;). Het staat ook in het materiaaltotaal op de offerte.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Korting op totaal</h3>
        <form action={submitTotalDiscount} className="flex flex-wrap items-end gap-3">
          <FormErrors errors={errors} className="w-full" />
          <input type="hidden" name="projectId" value={projectId} />
          <label className="grid gap-1 text-sm">
            Bedrag (EUR)
            <input
              name="totalDiscountAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="bijv. 250"
              defaultValue={costs.totalDiscountAmount ?? ''}
              className="w-40 rounded border border-zinc-300 bg-white px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Opslaan
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-500">
          Vaste korting op het subtotaal (materiaal + personeel + transport). Laat leeg om te
          verwijderen.
        </p>
      </section>
    </div>
  );
}
