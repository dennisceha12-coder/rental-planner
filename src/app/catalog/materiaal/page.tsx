import Link from 'next/link';
import { prisma } from '@/lib/db';
import EquipmentForm from '@/components/EquipmentForm';
import CatalogEquipmentList from '@/components/CatalogEquipmentList';

export const dynamic = 'force-dynamic';

export default async function CatalogMateriaalPage() {
  const [categories, equipment] = await Promise.all([
    prisma.equipmentCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.equipment.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    }),
  ]);

  return (
    <div className="space-y-8">
      {categories.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Nog geen categorieën.{' '}
          <Link href="/catalog/categorieen" className="font-medium underline">
            Eerst een categorie aanmaken
          </Link>
        </p>
      )}

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
