'use client';

import { useTransition } from 'react';
import { deleteEquipment } from '@/app/actions';

export default function DeleteEquipmentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Materiaal verwijderen?')) return;
        startTransition(() => {
          void deleteEquipment(id);
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Verwijderen
    </button>
  );
}
