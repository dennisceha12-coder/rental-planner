'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/app/actions';

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void logoutAction();
        });
      }}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
    >
      Uitloggen
    </button>
  );
}
