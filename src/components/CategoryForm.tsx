'use client';

import { useTransition } from 'react';
import { createEquipmentCategory, updateEquipmentCategory } from '@/app/actions';

type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

export default function CategoryForm({ category }: { category?: Category }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void (category
            ? updateEquipmentCategory(category.id, fd)
            : createEquipmentCategory(fd));
        });
      }}
      className="grid max-w-md gap-3 sm:grid-cols-2"
    >
      <label className="grid gap-1 text-sm sm:col-span-2">
        Naam *
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Volgorde
        <input
          name="sortOrder"
          type="number"
          min={0}
          step={1}
          placeholder="Automatisch"
          defaultValue={category?.sortOrder ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Opslaan…' : category ? 'Bijwerken' : 'Toevoegen'}
        </button>
      </div>
    </form>
  );
}
