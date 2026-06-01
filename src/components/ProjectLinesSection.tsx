'use client';

import { useTransition } from 'react';
import { addProjectLine, deleteProjectLine } from '@/app/actions';
import {
  lineBreakdown,
  projectMaterialTotal,
  formatEur,
  quantityUsedOnProject,
} from '@/lib/pricing';
import { toDateInputValue } from '@/lib/dates';
import type { Equipment } from '@/generated/prisma/client';
import type { LineWithEquipment } from '@/lib/pricing';

type Line = LineWithEquipment & { id: string; equipmentId: string; projectId: string };

export default function ProjectLinesSection({
  projectId,
  lines,
  equipment,
  defaultStart,
  defaultEnd,
}: {
  projectId: string;
  lines: Line[];
  equipment: Equipment[];
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const [pending, startTransition] = useTransition();
  const total = projectMaterialTotal(lines);

  const stockWarnings = [...new Set(lines.map((l) => l.equipmentId))]
    .map((equipmentId) => {
      const sample = lines.find((l) => l.equipmentId === equipmentId)!;
      const used = quantityUsedOnProject(lines, equipmentId);
      const stock = sample.equipment.stockQty;
      if (stock == null || used <= stock) return null;
      return `${sample.equipment.name}: ${used} geboekt, voorraad ${stock}`;
    })
    .filter(Boolean) as string[];

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

      <form
        action={(fd) => {
          startTransition(() => {
            void addProjectLine(fd);
          });
        }}
        className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <label className="grid gap-1 text-sm lg:col-span-2">
          Materiaal
          <select name="equipmentId" required className="rounded border border-zinc-300 px-3 py-2">
            <option value="">Kies…</option>
            {equipment.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({formatEur(e.dailyRate)}/dag)
              </option>
            ))}
          </select>
        </label>
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
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 lg:col-span-5 lg:w-fit"
        >
          Regel toevoegen
        </button>
      </form>

      {lines.length === 0 ? (
        <p className="text-sm text-zinc-500">Nog geen materiaal op dit project.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-2">Materiaal</th>
                <th className="px-4 py-2">Aantal</th>
                <th className="px-4 py-2">Periode</th>
                <th className="px-4 py-2">Dagen</th>
                <th className="px-4 py-2 text-right">Totaal</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lines.map((line) => {
                const { days, total: lineTotal } = lineBreakdown(line);
                return (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{line.equipment.name}</div>
                      {line.equipment.category && (
                        <div className="text-xs text-zinc-500">{line.equipment.category}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{line.quantity}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {toDateInputValue(line.rentalStart)} → {toDateInputValue(line.rentalEnd)}
                    </td>
                    <td className="px-4 py-3">{days}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatEur(lineTotal)}
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
                        className="text-red-600 hover:underline text-xs"
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
                <td colSpan={4} className="px-4 py-3 text-right font-semibold">
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
