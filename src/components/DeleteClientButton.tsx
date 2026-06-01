'use client';

import { useTransition } from 'react';
import { deleteClient } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import { useState } from 'react';
import type { FieldErrors } from '@/lib/form-errors';

export default function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();

  return (
    <div>
      <FormErrors errors={errors} className="mb-2" />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Klant "${name}" verwijderen?`)) return;
          startTransition(() => {
            void (async () => {
              const result = await deleteClient(id);
              if (result?.error) setErrors(result.error);
            })();
          });
        }}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        Verwijder klant
      </button>
    </div>
  );
}
