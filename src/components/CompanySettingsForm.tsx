'use client';

import { useTransition } from 'react';
import { updateCompanySettings } from '@/app/actions';
import type { CompanySettings } from '@/generated/prisma/client';

export default function CompanySettingsForm({ settings }: { settings: CompanySettings }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void updateCompanySettings(fd);
        });
      }}
      className="max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
    >
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
