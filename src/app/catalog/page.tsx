import { prisma } from '@/lib/db';
import EquipmentForm from '@/components/EquipmentForm';
import CategoryForm from '@/components/CategoryForm';
import DeleteCategoryButton from '@/components/DeleteCategoryButton';
import CatalogEquipmentList from '@/components/CatalogEquipmentList';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const [categories, equipment] = await Promise.all([
    prisma.equipmentCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { equipment: true } } },
    }),
    prisma.equipment.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Catalogus materiaal</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Beheer categorieën en koppel materiaal via een vaste lijst — geen vrije tekst meer.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Categorieën</h2>
        <CategoryForm />
        {categories.length > 0 && (
          <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
            {categories.map((cat) => (
              <li key={cat.id} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-zinc-500">
                      Volgorde {cat.sortOrder} · {cat._count.equipment} item(s)
                    </p>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-zinc-600">Bewerken</summary>
                    <div className="mt-3 rounded border border-zinc-200 bg-zinc-50 p-3">
                      <CategoryForm category={cat} />
                      <div className="mt-2 border-t border-zinc-200 pt-2">
                        <DeleteCategoryButton id={cat.id} />
                      </div>
                    </div>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Nieuw materiaal</h2>
        <EquipmentForm categories={categories} />
      </section>

      <CatalogEquipmentList
        equipment={equipment.map((item) => ({
          ...item,
          category: item.category
            ? { id: item.category.id, name: item.category.name, sortOrder: item.category.sortOrder }
            : null,
        }))}
        categories={categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
        }))}
      />
    </div>
  );
}
