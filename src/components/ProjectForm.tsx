'use client';

import { useState, useTransition } from 'react';
import { createProject, updateProject } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import { STATUS_LABELS, TRANSPORT_TYPE_LABELS } from '@/lib/validators';
import { toDateInputValue } from '@/lib/dates';
import {
  DEFAULT_TRANSPORT_RATE_PER_KM,
} from '@/lib/constants';
import type { FieldErrors } from '@/lib/form-errors';
import type { Project, Client, ProjectStatus, TransportType } from '@/generated/prisma/client';

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
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const [transportType, setTransportType] = useState<TransportType>(
    project?.transportType ?? 'PER_KM'
  );
  const isEdit = !!project;

  function onSubmit(formData: FormData) {
    startTransition(() => {
      void (async () => {
        if (isEdit && project) {
          const result = await updateProject(project.id, formData);
          if (result?.error) {
            setErrors(result.error);
            return;
          }
          setErrors(undefined);
        } else {
          const result = await createProject(formData);
          if (result?.error) setErrors(result.error);
        }
      })();
    });
  }

  const statuses = Object.keys(STATUS_LABELS) as ProjectStatus[];

  return (
    <form action={onSubmit} className="max-w-2xl space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
      <FormErrors errors={errors} />
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm sm:col-span-2">
          Projecttitel *
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
          <div className="grid gap-1 text-sm sm:col-span-2">
            <span>Klant *</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                name="clientId"
                required
                defaultValue={project.clientId}
                className="min-w-[12rem] flex-1 rounded border border-zinc-300 px-3 py-2"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <a href="/clients" className="text-sm text-zinc-600 underline hover:text-zinc-900">
                Klant beheren
              </a>
            </div>
          </div>
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

        <div className="sm:col-span-2 mt-2 border-t border-zinc-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Transport (offerte)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm sm:col-span-2">
              Type
              <select
                name="transportType"
                value={transportType}
                onChange={(e) => setTransportType(e.target.value as TransportType)}
                className="rounded border border-zinc-300 px-3 py-2 sm:max-w-xs"
              >
                {(Object.keys(TRANSPORT_TYPE_LABELS) as TransportType[]).map((type) => (
                  <option key={type} value={type}>
                    {TRANSPORT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            {transportType === 'PER_KM' ? (
              <>
                <label className="grid gap-1 text-sm">
                  Afstand (km)
                  <input
                    name="transportKm"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="bijv. 85"
                    defaultValue={project?.transportKm ?? ''}
                    className="rounded border border-zinc-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Vergoeding (EUR per km)
                  <input
                    name="transportRatePerKm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={String(DEFAULT_TRANSPORT_RATE_PER_KM)}
                    defaultValue={project?.transportRatePerKm ?? ''}
                    className="rounded border border-zinc-300 px-3 py-2"
                  />
                </label>
              </>
            ) : (
              <label className="grid gap-1 text-sm sm:col-span-2 sm:max-w-xs">
                Vast tarief (EUR)
                <input
                  name="transportFixedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="bijv. 350"
                  defaultValue={project?.transportFixedAmount ?? ''}
                  className="rounded border border-zinc-300 px-3 py-2"
                />
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Personeelsplanning stel je in op het tabblad <strong>Personeel</strong>.
          </p>
        </div>

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
        {pending ? 'Opslaan…' : isEdit ? 'Project bijwerken' : 'Project aanmaken'}
      </button>
    </form>
  );
}
