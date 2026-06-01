'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import { useState } from 'react';
import type { FieldErrors } from '@/lib/form-errors';

export default function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';

  return (
    <form
      action={(fd) => {
        fd.set('from', from);
        startTransition(() => {
          void (async () => {
            const result = await loginAction(fd);
            if (result?.error) setErrors(result.error);
          })();
        });
      }}
      className="mx-auto max-w-sm space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
    >
      <FormErrors errors={errors} />
      <label className="grid gap-1 text-sm">
        Wachtwoord
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Inloggen…' : 'Inloggen'}
      </button>
    </form>
  );
}
