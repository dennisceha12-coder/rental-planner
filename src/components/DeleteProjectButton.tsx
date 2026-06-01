'use client';

import { useTransition } from 'react';
import { deleteProject } from '@/app/actions';

export default function DeleteProjectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Project en alle materiaalregels permanent verwijderen?')) return;
        startTransition(() => {
          void deleteProject(id);
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Project verwijderen
    </button>
  );
}
