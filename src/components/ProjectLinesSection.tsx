'use client';

import { useState, useTransition } from 'react';
import {
  addProjectLine,
  deleteProjectLine,
  updateProjectLine,
  updateProjectLineDiscount,
} from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import {
  lineBreakdown,
  projectMaterialTotal,
  formatEur,
  formatDiscountLabel,
  quantityUsedOnProject,
  projectLineName,
  projectLineCategory,
  projectLineDailyRate,
  isCustomProjectLine,
  isExternalRentalLine,
  type ProjectLineRecord,
} from '@/lib/pricing';
import { toDateInputValue } from '@/lib/dates';
import { groupEquipmentByCategory } from '@/lib/equipment-categories';
import type { FieldErrors } from '@/lib/form-errors';

type CatalogEquipment = {
  id: string;
  name: string;
  dailyRate: number;
  isExternalRental: boolean;
  categoryId: string | null;
  category: { id: string; name: string; sortOrder: number } | null;
};

type Line = ProjectLineRecord & { id: string; projectId: string };

function DiscountFields({
  discountType,
  discountValue,
  compact,
}: {
  discountType?: string | null;
  discountValue?: number | null;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'items-center' : ''}`}>
      <select
        name="discountType"
        defaultValue={discountType ?? ''}
        className={`rounded border border-zinc-300 bg-white px-2 py-1 text-xs ${compact ? 'max-w-[7rem]' : ''}`}
      >
        <option value="">Geen</option>
        <option value="PERCENTAGE">%</option>
        <option value="AMOUNT">EUR</option>
      </select>
      <input
        name="discountValue"
        type="number"
        step="0.01"
        min="0"
        placeholder={discountType === 'PERCENTAGE' ? '10' : '50'}
        defaultValue={discountValue ?? ''}
        className={`rounded border border-zinc-300 bg-white px-2 py-1 text-xs tabular-nums ${compact ? 'w-16' : 'w-24'}`}
      />
    </div>
  );
}

function filterEquipment(equipment: CatalogEquipment[], query: string): CatalogEquipment[] {
  const q = query.trim().toLowerCase();
  if (!q) return equipment;
  return equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.category?.name.toLowerCase().includes(q)
  );
}

function LineForm({
  projectId,
  lineType,
  equipment,
  defaultStart,
  defaultEnd,
  pending,
  catalogQuery,
  onCatalogQueryChange,
  onSubmit,
  errors,
}: {
  projectId: string;
  lineType: 'catalog' | 'custom';
  equipment?: CatalogEquipment[];
  defaultStart?: string;
  defaultEnd?: string;
  pending: boolean;
  catalogQuery?: string;
  onCatalogQueryChange?: (q: string) => void;
  onSubmit: (fd: FormData) => void;
  errors?: FieldErrors;
}) {
  const isCatalog = lineType === 'catalog';
  const filtered = equipment ? filterEquipment(equipment, catalogQuery ?? '') : [];

  return (
    <form action={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="lineType" value={lineType} />
      <FormErrors errors={errors} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isCatalog ? (
          <div className="grid gap-1 text-sm sm:col-span-2">
            <label>
              Zoek materiaal
              <input
                type="search"
                value={catalogQuery ?? ''}
                onChange={(e) => onCatalogQueryChange?.(e.target.value)}
                placeholder="Filter op naam of categorie…"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="mt-2 grid gap-1">
              Materiaal *
              <select name="equipmentId" required className="rounded border border-zinc-300 px-3 py-2">
                <option value="">Kies…</option>
                {groupEquipmentByCategory(filtered).map((group) => (
                  <optgroup key={group.key} label={group.name}>
                    {group.items.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                        {e.isExternalRental ? ' (inhuur)' : ''} ({formatEur(e.dailyRate)}/dag)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Omschrijving
              <input
                name="customName"
                type="text"
                required
                placeholder="Bijv. extra kabels gehuurd"
                className="rounded border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Dagtarief (€)
              <input
                name="customDailyRate"
                type="number"
                min={0.01}
                step={0.01}
                required
                placeholder="0,00"
                className="rounded border border-zinc-300 px-3 py-2"
              />
            </label>
          </>
        )}

        <label className="grid gap-1 text-sm">
          Aantal
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Van
          <input
            name="rentalStart"
            type="date"
            required
            defaultValue={defaultStart}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Tot
          <input
            name="rentalEnd"
            type="date"
            required
            defaultValue={defaultEnd}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-zinc-200 pt-3">
        <div className="grid gap-1 text-sm">
          <span>Korting (optioneel)</span>
          <DiscountFields />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isCatalog ? 'Uit catalogus toevoegen' : 'Tijdelijk materiaal toevoegen'}
        </button>
      </div>
    </form>
  );
}

function LineEditForm({
  line,
  pending,
  onSubmit,
  errors,
}: {
  line: Line;
  pending: boolean;
  onSubmit: (fd: FormData) => void;
  errors?: FieldErrors;
}) {
  const isCustom = isCustomProjectLine(line);

  return (
    <form action={onSubmit} className="mt-2 space-y-2 rounded border border-zinc-200 bg-zinc-50 p-3">
      <input type="hidden" name="projectId" value={line.projectId} />
      <input type="hidden" name="lineType" value={isCustom ? 'custom' : 'catalog'} />
      {line.equipmentId && <input type="hidden" name="equipmentId" value={line.equipmentId} />}
      <FormErrors errors={errors} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {isCustom && (
          <>
            <label className="grid gap-1 text-xs sm:col-span-2">
              Omschrijving
              <input
                name="customName"
                required
                defaultValue={line.customName ?? ''}
                className="rounded border border-zinc-300 px-2 py-1"
              />
            </label>
            <label className="grid gap-1 text-xs">
              Dagtarief (€)
              <input
                name="customDailyRate"
                type="number"
                min={0.01}
                step={0.01}
                required
                defaultValue={line.customDailyRate ?? ''}
                className="rounded border border-zinc-300 px-2 py-1"
              />
            </label>
          </>
        )}
        <label className="grid gap-1 text-xs">
          Aantal
          <input
            name="quantity"
            type="number"
            min={1}
            required
            defaultValue={line.quantity}
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
        <label className="grid gap-1 text-xs">
          Van
          <input
            name="rentalStart"
            type="date"
            required
            defaultValue={toDateInputValue(line.rentalStart)}
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
        <label className="grid gap-1 text-xs">
          Tot
          <input
            name="rentalEnd"
            type="date"
            required
            defaultValue={toDateInputValue(line.rentalEnd)}
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-zinc-900 hover:underline disabled:opacity-50"
      >
        Regel opslaan
      </button>
    </form>
  );
}

function LineDiscountForm({
  line,
  pending,
  onSubmit,
  errors,
}: {
  line: Line;
  pending: boolean;
  onSubmit: (fd: FormData) => void;
  errors?: FieldErrors;
}) {
  return (
    <form action={onSubmit} className="flex min-w-[9rem] flex-col gap-1">
      <input type="hidden" name="projectId" value={line.projectId} />
      <FormErrors errors={errors} />
      <DiscountFields
        discountType={line.discountType}
        discountValue={line.discountValue}
        compact
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start text-xs text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
      >
        Opslaan
      </button>
    </form>
  );
}

export default function ProjectLinesSection({
  projectId,
  lines,
  equipment,
  defaultStart,
  defaultEnd,
}: {
  projectId: string;
  lines: Line[];
  equipment: CatalogEquipment[];
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [catalogQuery, setCatalogQuery] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, FieldErrors | undefined>>({});
  const total = projectMaterialTotal(lines);

  const stockWarnings = [
    ...new Set(
      lines
        .filter((l) => l.equipmentId && !isExternalRentalLine(l))
        .map((l) => l.equipmentId!)
    ),
  ]
    .map((equipmentId) => {
      const sample = lines.find((l) => l.equipmentId === equipmentId)!;
      const used = quantityUsedOnProject(lines, equipmentId);
      const stock = sample.equipment?.stockQty;
      if (stock == null || used <= stock) return null;
      return `${sample.equipment!.name}: ${used} geboekt, voorraad ${stock}`;
    })
    .filter(Boolean) as string[];

  const submitLine = (key: string, fd: FormData) => {
    startTransition(() => {
      void (async () => {
        const result = await addProjectLine(fd);
        if (result?.error) {
          setFormErrors((prev) => ({ ...prev, [key]: result.error }));
          return;
        }
        setFormErrors((prev) => ({ ...prev, [key]: undefined }));
      })();
    });
  };

  const submitLineEdit = (lineId: string, fd: FormData) => {
    startTransition(() => {
      void (async () => {
        const result = await updateProjectLine(lineId, fd);
        if (result?.error) {
          setFormErrors((prev) => ({ ...prev, [`edit-${lineId}`]: result.error }));
          return;
        }
        setFormErrors((prev) => ({ ...prev, [`edit-${lineId}`]: undefined }));
      })();
    });
  };

  const submitLineDiscount = (lineId: string, fd: FormData) => {
    startTransition(() => {
      void (async () => {
        const result = await updateProjectLineDiscount(lineId, fd);
        if (result?.error) {
          setFormErrors((prev) => ({ ...prev, [`discount-${lineId}`]: result.error }));
          return;
        }
        setFormErrors((prev) => ({ ...prev, [`discount-${lineId}`]: undefined }));
      })();
    });
  };

  return (
    <div className="space-y-6">
      {stockWarnings.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Voorraadwaarschuwing:</strong>
          <ul className="mt-1 list-disc pl-5">
            {stockWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Uit catalogus</h3>
        <LineForm
          projectId={projectId}
          lineType="catalog"
          equipment={equipment}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          pending={pending}
          catalogQuery={catalogQuery}
          onCatalogQueryChange={setCatalogQuery}
          onSubmit={(fd) => submitLine('catalog', fd)}
          errors={formErrors.catalog}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Tijdelijk materiaal</h3>
        <p className="text-xs text-zinc-500">
          Eenmalige regels die niet in de catalogus staan, bijvoorbeeld gehuurd materiaal of
          losse artikelen.
        </p>
        <LineForm
          projectId={projectId}
          lineType="custom"
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          pending={pending}
          onSubmit={(fd) => submitLine('custom', fd)}
          errors={formErrors.custom}
        />
      </div>

      {lines.length === 0 ? (
        <p className="text-sm text-zinc-500">Nog geen materiaal op dit project.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-2">Materiaal</th>
                <th className="px-4 py-2">Aantal</th>
                <th className="px-4 py-2">Periode</th>
                <th className="px-4 py-2">Dagen</th>
                <th className="px-4 py-2">Korting</th>
                <th className="px-4 py-2 text-right">Totaal</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lines.map((line) => {
                const { days, gross, discount, total: lineTotal } = lineBreakdown(line);
                const category = projectLineCategory(line);
                const discountLabel = formatDiscountLabel(line);
                return (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{projectLineName(line)}</div>
                      {category && <div className="text-xs text-zinc-500">{category}</div>}
                      {isCustomProjectLine(line) && (
                        <div className="text-xs text-zinc-500">
                          {formatEur(projectLineDailyRate(line))}/dag
                        </div>
                      )}
                      {isExternalRentalLine(line) && (
                        <div className="text-xs text-amber-700">Extern inhuur</div>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-zinc-600">Bewerken</summary>
                        <LineEditForm
                          line={line}
                          pending={pending}
                          onSubmit={(fd) => submitLineEdit(line.id, fd)}
                          errors={formErrors[`edit-${line.id}`]}
                        />
                      </details>
                    </td>
                    <td className="px-4 py-3">{line.quantity}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {toDateInputValue(line.rentalStart)} → {toDateInputValue(line.rentalEnd)}
                    </td>
                    <td className="px-4 py-3">{days}</td>
                    <td className="px-4 py-3">
                      <LineDiscountForm
                        line={line}
                        pending={pending}
                        onSubmit={(fd) => submitLineDiscount(line.id, fd)}
                        errors={formErrors[`discount-${line.id}`]}
                      />
                      {discount > 0 && discountLabel && (
                        <div className="mt-1 text-xs text-red-700">
                          −{formatEur(discount)} ({discountLabel})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {discount > 0 ? (
                        <>
                          <div className="text-xs text-zinc-400 line-through">
                            {formatEur(gross)}
                          </div>
                          <div className="font-medium">{formatEur(lineTotal)}</div>
                        </>
                      ) : (
                        <div className="font-medium">{formatEur(lineTotal)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm('Regel verwijderen?')) return;
                          startTransition(() => {
                            void deleteProjectLine(line.id, projectId);
                          });
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-zinc-200 bg-zinc-50">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right font-semibold">
                  Totaal materiaal
                </td>
                <td className="px-4 py-3 text-right text-lg font-semibold tabular-nums">
                  {formatEur(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
