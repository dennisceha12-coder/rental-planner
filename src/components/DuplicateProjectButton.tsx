'use client';

import { useTransition } from 'react';
import { duplicateProject } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import { useState } from 'react';
import type { FieldErrors } from '@/lib/form-errors';

export default function DuplicateProjectButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();

  return (
    <div>
      <FormErrors errors={errors} className="mb-2" />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm('Project dupliceren als nieuw concept?')) return;
          startTransition(() => {
            void (async () => {
              const result = await duplicateProject(projectId);
              if (result?.error) setErrors(result.error);
            })();
          });
        }}
        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
      >
        {pending ? 'Dupliceren…' : 'Project dupliceren'}
      </button>
    </div>
  );
}
