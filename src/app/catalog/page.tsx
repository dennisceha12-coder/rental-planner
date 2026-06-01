import { prisma } from '@/lib/db';
import { formatEur } from '@/lib/pricing';
import EquipmentForm from '@/components/EquipmentForm';
import DeleteEquipmentButton from '@/components/DeleteEquipmentButton';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Catalogus materiaal</h1>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Nieuw materiaal</h2>
        <EquipmentForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Alle items ({equipment.length})</h2>
        {equipment.length === 0 ? (
          <p className="text-sm text-zinc-500">Nog geen materiaal in de catalogus.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Naam</th>
                  <th className="px-4 py-2 font-medium">Categorie</th>
                  <th className="px-4 py-2 font-medium">Dagtarief</th>
                  <th className="px-4 py-2 font-medium">Voorraad</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.category ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{formatEur(item.dailyRate)}</td>
                    <td className="px-4 py-3">{item.stockQty ?? '∞'}</td>
                    <td className="px-4 py-3">
                      <details className="group">
                        <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900">
                          Bewerken
                        </summary>
                        <div className="mt-3 min-w-[280px] rounded border border-zinc-200 bg-zinc-50 p-3">
                          <EquipmentForm equipment={item} />
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
        )}
      </section>
    </div>
  );
}
