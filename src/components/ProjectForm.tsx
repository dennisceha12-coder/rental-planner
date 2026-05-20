'use client';

import { useTransition } from 'react';
import { createProject, updateProject } from '@/app/actions';
import { STATUS_LABELS } from '@/lib/validators';
import { toDateInputValue } from '@/lib/dates';
import type { Project, Client, ProjectStatus } from '@/generated/prisma/client';

type ProjectWithClient = Project & { client: Client };

export default function ProjectForm({
  clients,
  project,
  defaultQuoteNumber,
}: {
  clients: Client[];
  project?: ProjectWithClient;
  defaultQuoteNumber?: string;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!project;

  function onSubmit(formData: FormData) {
    startTransition(() => {
      void (async () => {
        if (isEdit && project) {
          await updateProject(project.id, formData);
        } else {
          await createProject(formData);
        }
      })();
    });
  }

  const statuses = Object.keys(STATUS_LABELS) as ProjectStatus[];

  return (
    <form action={onSubmit} className="max-w-2xl space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm sm:col-span-2">
          Titel klus *
          <input
            name="title"
            required
            defaultValue={project?.title}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Status
          <select
            name="status"
            defaultValue={project?.status ?? 'CONCEPT'}
            className="rounded border border-zinc-300 px-3 py-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Offertenummer
          <input
            name="quoteNumber"
            defaultValue={project?.quoteNumber ?? defaultQuoteNumber ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        {isEdit ? (
          <label className="grid gap-1 text-sm sm:col-span-2">
            Klant *
            <select
              name="clientId"
              required
              defaultValue={project.clientId}
              className="rounded border border-zinc-300 px-3 py-2"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Bestaande klant
              <select name="clientId" className="rounded border border-zinc-300 px-3 py-2">
                <option value="">— of nieuwe klant hieronder —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Nieuwe klantnaam (als geen selectie)
              <input name="newClientName" className="rounded border border-zinc-300 px-3 py-2" />
            </label>
          </>
        )}

        <label className="grid gap-1 text-sm sm:col-span-2">
          Locatie
          <input
            name="location"
            defaultValue={project?.location ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Load-in datum
          <input
            name="loadIn"
            type="date"
            defaultValue={toDateInputValue(project?.loadIn)}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Show datum
          <input
            name="showDate"
            type="date"
            defaultValue={toDateInputValue(project?.showDate)}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Load-out datum
          <input
            name="loadOut"
            type="date"
            defaultValue={toDateInputValue(project?.loadOut)}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Load-in tijd
          <input
            name="loadInTime"
            placeholder="08:00"
            defaultValue={project?.loadInTime ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Show tijd
          <input
            name="showTime"
            defaultValue={project?.showTime ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Load-out tijd
          <input
            name="loadOutTime"
            defaultValue={project?.loadOutTime ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm sm:col-span-2">
          Contact op locatie
          <input
            name="siteContact"
            defaultValue={project?.siteContact ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Parkeren / logistiek
          <textarea
            name="parkingNotes"
            rows={2}
            defaultValue={project?.parkingNotes ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Bijzonderheden
          <textarea
            name="notes"
            rows={3}
            defaultValue={project?.notes ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : isEdit ? 'Klus bijwerken' : 'Klus aanmaken'}
      </button>
    </form>
  );
}
