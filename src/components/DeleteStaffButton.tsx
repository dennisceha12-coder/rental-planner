'use client';

import { useTransition } from 'react';
import { deleteStaff } from '@/app/actions';

export default function DeleteStaffButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Teamlid verwijderen?')) return;
        startTransition(() => {
          void deleteStaff(id);
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Verwijderen
    </button>
  );
}
