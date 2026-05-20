'use client';

import { useTransition } from 'react';
import { createStaff, updateStaff } from '@/app/actions';

type Staff = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
};

export default function StaffForm({ member }: { member?: Staff }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void (member ? updateStaff(member.id, fd) : createStaff(fd));
        });
      }}
      className="grid max-w-md gap-3"
    >
      <label className="grid gap-1 text-sm">
        Naam *
        <input name="name" required defaultValue={member?.name} className="rounded border border-zinc-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        Standaard rol
        <input name="role" defaultValue={member?.role ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        Telefoon
        <input name="phone" defaultValue={member?.phone ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : member ? 'Bijwerken' : 'Toevoegen'}
      </button>
    </form>
  );
}
