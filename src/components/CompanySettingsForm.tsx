'use client';

import { useState, useTransition } from 'react';
import { updateCompanySettings } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import type { FieldErrors } from '@/lib/form-errors';
import {
  DEFAULT_RENTAL_STAFFEL,
  formatPercent,
  formatStaffelRule,
  staffelFactor,
} from '@/lib/pricing';
import type { CompanySettings } from '@/generated/prisma/client';

export default function CompanySettingsForm({ settings }: { settings: CompanySettings }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const [staffel, setStaffel] = useState<number[]>(
    settings.rentalStaffelPercents.length > 0
      ? [...settings.rentalStaffelPercents]
      : [...DEFAULT_RENTAL_STAFFEL]
  );

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void (async () => {
            const result = await updateCompanySettings(fd);
            if (result && 'error' in result) {
              setErrors(result.error);
              return;
            }
            setErrors(undefined);
          })();
        });
      }}
      className="max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
    >
      <FormErrors errors={errors} />
      <label className="grid gap-1 text-sm">
        Bedrijfsnaam *
        <input
          name="companyName"
          required
          defaultValue={settings.companyName}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Adres *
        <textarea
          name="address"
          required
          rows={2}
          defaultValue={settings.address}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          E-mail
          <input name="email" type="email" defaultValue={settings.email ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Telefoon
          <input name="phone" defaultValue={settings.phone ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          KvK-nummer
          <input name="kvkNumber" defaultValue={settings.kvkNumber ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          BTW-id
          <input name="vatNumber" defaultValue={settings.vatNumber ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          IBAN
          <input name="iban" defaultValue={settings.iban ?? ''} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Offerte geldig (dagen)
          <input
            name="quoteValidityDays"
            type="number"
            min={1}
            max={365}
            required
            defaultValue={settings.quoteValidityDays}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Standaard BTW (%)
          <input
            name="defaultVatRate"
            type="number"
            step="0.01"
            min={0}
            max={100}
            required
            defaultValue={settings.defaultVatRate}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Betalingsvoorwaarden
          <input
            name="paymentTerms"
            placeholder="14 dagen na factuurdatum"
            defaultValue={settings.paymentTerms ?? ''}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>
      <fieldset className="space-y-3 rounded-md border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-medium">Huurstaffel</legend>
        <p className="text-xs text-zinc-500">
          Percentage van de dagprijs per huurdag. De laatste regel geldt voor elke dag daarna:{' '}
          {formatStaffelRule(staffel)}. Dit geldt voor alle projecten, ook bestaande offertes.
        </p>
        <div className="space-y-2">
          {staffel.map((percent, index) => {
            const isOnly = staffel.length === 1;
            const isLast = index === staffel.length - 1;
            const label = isOnly ? 'Elke huurdag' : isLast ? `Dag ${index + 1} en verder` : `Dag ${index + 1}`;
            return (
              <div key={index} className="flex items-end gap-2">
                <label className="grid flex-1 gap-1 text-sm">
                  {label}
                  <input
                    name="staffelPercent"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    required
                    value={Number.isFinite(percent) ? percent : ''}
                    onChange={(event) => {
                      const next = [...staffel];
                      next[index] = event.target.value === '' ? Number.NaN : Number(event.target.value);
                      setStaffel(next);
                    }}
                    className="rounded border border-zinc-300 px-3 py-2"
                  />
                </label>
                <span className="pb-2 text-sm text-zinc-500">%</span>
                {staffel.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStaffel(staffel.filter((_, row) => row !== index))}
                    className="pb-2 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setStaffel([...staffel, staffel[staffel.length - 1] ?? 25])}
          className="text-sm text-zinc-700 underline"
        >
          Extra dag toevoegen
        </button>
        <p className="text-xs text-zinc-600">
          {[1, 2, 3, 7]
            .map(
              (days) =>
                `${days} ${days === 1 ? 'dag' : 'dagen'} = ${formatPercent(staffelFactor(days, staffel) * 100)}`
            )
            .join(' · ')}
        </p>
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : 'Bedrijfsgegevens opslaan'}
      </button>
    </form>
  );
}
