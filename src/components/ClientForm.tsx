'use client';

import { useState, useTransition } from 'react';
import { createClient, updateClient } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import type { FieldErrors } from '@/lib/form-errors';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
};

export default function ClientForm({ client }: { client?: Client }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void (async () => {
            const result = client ? await updateClient(client.id, fd) : await createClient(fd);
            if (result?.error) {
              setErrors(result.error);
              return;
            }
            setErrors(undefined);
          })();
        });
      }}
      className="grid max-w-md gap-3"
    >
      <FormErrors errors={errors} />
      <label className="grid gap-1 text-sm">
        Naam *
        <input
          name="name"
          required
          defaultValue={client?.name}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          defaultValue={client?.email ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Telefoon
        <input
          name="phone"
          defaultValue={client?.phone ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Adres
        <textarea
          name="address"
          rows={2}
          defaultValue={client?.address ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        BTW-nummer
        <input
          name="vatNumber"
          defaultValue={client?.vatNumber ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : client ? 'Bijwerken' : 'Toevoegen'}
      </button>
    </form>
  );
}
