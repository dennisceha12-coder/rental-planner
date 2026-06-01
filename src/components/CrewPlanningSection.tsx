'use client';

import { useState, useTransition } from 'react';
import {
  addCrewShift,
  deleteCrewShift,
  updateCrewShift,
  updateProjectHourlyRate,
} from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import {
  shiftCost,
  shiftDurationHours,
  shiftManHours,
  CREW_PHASE_LABELS,
  formatStaffLabel,
  type CrewShiftInput,
} from '@/lib/crew';
import { formatEur } from '@/lib/pricing';
import { toDateInputValue } from '@/lib/dates';
import { DEFAULT_HOURLY_RATE } from '@/lib/constants';
import type { FieldErrors } from '@/lib/form-errors';
import type { CrewPhase } from '@/generated/prisma/client';

type StaffOption = { id: string; name: string; role: string | null };

function ShiftForm({
  projectId,
  staff,
  shift,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  onDone,
}: {
  projectId: string;
  staff: StaffOption[];
  shift?: CrewShiftInput & { assignedStaffIds?: string[] };
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const phases = Object.keys(CREW_PHASE_LABELS) as CrewPhase[];
  const isEdit = !!shift;

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void (async () => {
            const selected = staff.filter((s) => fd.get(`staff_${s.id}`) === 'on');
            fd.set('staffIds', selected.map((s) => s.id).join(','));
            const result =
              isEdit && shift ? await updateCrewShift(shift.id, fd) : await addCrewShift(fd);
            if (result?.error) {
              setErrors(result.error);
              return;
            }
            setErrors(undefined);
            onDone?.();
          })();
        });
      }}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <FormErrors errors={errors} className="sm:col-span-2 lg:col-span-4" />
      <input type="hidden" name="projectId" value={projectId} />
      <label className="grid gap-1 text-sm">
        Fase
        <select
          name="phase"
          required
          defaultValue={shift?.phase ?? 'OPBOUW'}
          className="rounded border border-zinc-300 px-3 py-2"
        >
          {phases.map((p) => (
            <option key={p} value={p}>
              {CREW_PHASE_LABELS[p]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Rol / functie
        <input
          name="role"
          placeholder="Technicus, rigger…"
          defaultValue={shift?.role ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Personen (min.)
        <input
          name="headcount"
          type="number"
          min={1}
          defaultValue={shift?.headcount ?? 2}
          required
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Datum
        <input
          name="date"
          type="date"
          required
          defaultValue={shift ? toDateInputValue(shift.date) : defaultDate}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Van
        <input
          name="startTime"
          required
          defaultValue={shift?.startTime ?? defaultStartTime ?? '08:00'}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Tot
        <input
          name="endTime"
          required
          defaultValue={shift?.endTime ?? defaultEndTime ?? '14:00'}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Uurtarief (optioneel)
        <input
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          placeholder="Standaard"
          defaultValue={shift?.hourlyRate ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      {staff.length > 0 && (
        <fieldset className="sm:col-span-2 lg:col-span-4">
          <legend className="mb-2 text-sm font-medium">Teamleden toewijzen</legend>
          <div className="flex flex-wrap gap-3">
            {staff.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`staff_${s.id}`}
                  defaultChecked={shift?.assignedStaffIds?.includes(s.id)}
                />
                {s.name}
                {s.role ? <span className="text-zinc-400">({s.role})</span> : null}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 lg:col-span-4 lg:w-fit"
      >
        {pending ? 'Opslaan…' : isEdit ? 'Shift bijwerken' : 'Shift toevoegen'}
      </button>
    </form>
  );
}

type ShiftRow = CrewShiftInput & { assignedStaffIds: string[] };

export default function CrewPlanningSection({
  projectId,
  shifts,
  staff,
  defaultHourlyRate,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: {
  projectId: string;
  shifts: ShiftRow[];
  staff: StaffOption[];
  defaultHourlyRate: number | null;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [hourlyErrors, setHourlyErrors] = useState<FieldErrors | undefined>();

  return (
    <div className="space-y-6">
      <form
        action={(fd) => {
          startTransition(() => {
            void (async () => {
              const result = await updateProjectHourlyRate(projectId, fd);
              if (result?.error) setHourlyErrors(result.error);
              else setHourlyErrors(undefined);
            })();
          });
        }}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
      >
        <FormErrors errors={hourlyErrors} className="w-full" />
        <label className="grid gap-1 text-sm">
          Standaard uurtarief personeel (EUR)
          <input
            name="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            placeholder={String(DEFAULT_HOURLY_RATE)}
            defaultValue={defaultHourlyRate ?? ''}
            className="w-40 rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Tarief opslaan
        </button>
      </form>

      {staff.length === 0 && (
        <p className="text-sm text-zinc-500">
          Tip: voeg teamleden toe via{' '}
          <a href="/staff" className="font-medium text-zinc-900 underline">
            Team
          </a>{' '}
          om namen op de planning te zetten.
        </p>
      )}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="mb-3 text-sm font-semibold">Nieuwe shift</h3>
        <ShiftForm
          projectId={projectId}
          staff={staff}
          defaultDate={defaultDate}
          defaultStartTime={defaultStartTime}
          defaultEndTime={defaultEndTime}
        />
      </div>

      {shifts.length === 0 ? (
        <p className="text-sm text-zinc-500">Nog geen personeelsplanning.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-2">Fase</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Datum</th>
                <th className="px-4 py-2">Tijd</th>
                <th className="px-4 py-2 text-right">Manuren</th>
                <th className="px-4 py-2 text-right">Kosten</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {shifts.map((shift) => {
                const manHours = shiftManHours(shift);
                const cost = shiftCost(shift, defaultHourlyRate);
                return (
                  <tr key={shift.id}>
                    <td className="px-4 py-3 font-medium">{CREW_PHASE_LABELS[shift.phase]}</td>
                    <td className="px-4 py-3">
                      <div>{formatStaffLabel(shift)}</div>
                      {shift.role && (
                        <div className="text-xs text-zinc-500">{shift.role}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{toDateInputValue(shift.date)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {shift.startTime}–{shift.endTime}
                      <span className="ml-1 text-xs text-zinc-400">
                        ({shiftDurationHours(shift.startTime, shift.endTime)}u)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{manHours}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatEur(cost)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-zinc-600">Bewerken</summary>
                        <div className="mt-3 min-w-[320px] rounded border border-zinc-200 bg-zinc-50 p-3">
                          <ShiftForm
                            projectId={projectId}
                            staff={staff}
                            shift={shift}
                          />
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                              if (!confirm('Shift verwijderen?')) return;
                              startTransition(() => {
                                void deleteCrewShift(shift.id, projectId);
                              });
                            }}
                            className="mt-3 text-xs text-red-600 hover:underline"
                          >
                            Shift verwijderen
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
