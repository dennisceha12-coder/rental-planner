'use client';

import { useTransition } from 'react';
import { deleteEquipmentCategory } from '@/app/actions';

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Categorie verwijderen?')) return;
        startTransition(() => {
          void deleteEquipmentCategory(id).then((result) => {
            if (result?.error) alert(result.error);
          });
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Verwijder categorie
    </button>
  );
}
