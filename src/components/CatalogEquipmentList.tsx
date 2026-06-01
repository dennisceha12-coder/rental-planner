'use client';

import { useMemo, useState } from 'react';
import { formatEur, formatDailyRate } from '@/lib/pricing';
import { groupEquipmentByCategory, categoryDisplayName } from '@/lib/equipment-categories';
import EquipmentForm from '@/components/EquipmentForm';
import DeleteEquipmentButton from '@/components/DeleteEquipmentButton';

type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

type Equipment = {
  id: string;
  name: string;
  categoryId: string | null;
  category: Category | null;
  dailyRate: number;
  stockQty: number | null;
  isExternalRental: boolean;
};

export default function CatalogEquipmentList({
  equipment,
  categories,
}: {
  equipment: Equipment[];
  categories: Category[];
}) {
  const [filterId, setFilterId] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filterId === 'all') return equipment;
    if (filterId === '__none__') {
      return equipment.filter((item) => !item.categoryId);
    }
    return equipment.filter((item) => item.categoryId === filterId);
  }, [equipment, filterId]);

  const groups = useMemo(() => groupEquipmentByCategory(filtered), [filtered]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium">Catalogus ({equipment.length})</h2>
        <div className="flex flex-wrap gap-1">
          <FilterChip
            label="Alle"
            active={filterId === 'all'}
            onClick={() => setFilterId('all')}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={filterId === cat.id}
              onClick={() => setFilterId(cat.id)}
            />
          ))}
        </div>
      </div>

      {equipment.length === 0 ? (
        <p className="text-sm text-zinc-500">Nog geen materiaal in de catalogus.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">Geen items in deze categorie.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2">
                <h3 className="text-sm font-semibold text-zinc-800">
                  {group.name}{' '}
                  <span className="font-normal text-zinc-500">({group.items.length})</span>
                </h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">Naam</th>
                    <th className="px-4 py-2 font-medium">Dagtarief</th>
                    <th className="px-4 py-2 font-medium">Voorraad</th>
                    <th className="px-4 py-2 font-medium">Inhuur</th>
                    <th className="px-4 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {group.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 tabular-nums">{formatDailyRate(item.dailyRate)}</td>
                      <td className="px-4 py-3">{item.stockQty ?? '∞'}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {item.isExternalRental ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                            Extern
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <details className="group">
                          <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900">
                            Bewerken
                          </summary>
                          <div className="mt-3 min-w-[280px] rounded border border-zinc-200 bg-zinc-50 p-3">
                            <EquipmentForm equipment={item} categories={categories} />
                            <div className="mt-2 border-t border-zinc-200 pt-2">
                              <DeleteEquipmentButton id={item.id} />
                            </div>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100'
      }`}
    >
      {label}
    </button>
  );
}

export type { Category };
