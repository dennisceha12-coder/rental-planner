'use client';

import { useState, useTransition } from 'react';
import { createClient, updateClient } from '@/app/actions';
import FormErrors from '@/components/FormErrors';
import {
  CLIENT_COUNTRY_OPTIONS,
  CLIENT_TYPE_LABELS,
  isEuCountry,
} from '@/lib/clients';
import type { FieldErrors } from '@/lib/form-errors';
import type { ClientType } from '@/generated/prisma/client';

type Client = {
  id: string;
  type: ClientType;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
  countryCode: string;
  vatReverseChargeDefault: boolean;
};

export default function ClientForm({ client }: { client?: Client }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors | undefined>();
  const [type, setType] = useState<ClientType>(client?.type ?? 'BEDRIJF');
  const [countryCode, setCountryCode] = useState(client?.countryCode ?? 'NL');
  const [reverseCharge, setReverseCharge] = useState(
    client?.vatReverseChargeDefault ?? false
  );
  const isBusiness = type === 'BEDRIJF';
  const inEu = isEuCountry(countryCode);
  const reverseChargeEligible = isBusiness && inEu && countryCode !== 'NL';

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
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Type klant</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
              />
              {CLIENT_TYPE_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1 text-sm">
        {isBusiness ? 'Bedrijfsnaam *' : 'Naam *'}
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
        Land
        <select
          name="countryCode"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2"
        >
          {CLIENT_COUNTRY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        BTW-nummer
        <input
          name="vatNumber"
          placeholder={countryCode === 'BE' ? 'BE0123456789' : undefined}
          defaultValue={client?.vatNumber ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      {isBusiness && (
        <label
          className={`flex items-start gap-2 text-sm ${
            reverseChargeEligible ? '' : 'text-zinc-500'
          }`}
        >
          <input
            type="checkbox"
            name="vatReverseChargeDefault"
            checked={reverseCharge}
            onChange={(event) => setReverseCharge(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            BTW verlegd bij nieuwe projecten (intracommunautair B2B).
            {!reverseChargeEligible && (
              <span className="mt-0.5 block text-xs">
                Alleen bedoeld voor zakelijke klanten in een ander EU-land. De keuze blijft
                bewaard maar wordt genegeerd zolang land en type niet kloppen.
              </span>
            )}
            {reverseChargeEligible && (
              <span className="mt-0.5 block text-xs text-zinc-500">
                Nieuwe projecten voor deze klant krijgen 0% BTW met vermelding &quot;BTW
                verlegd&quot;. Vul het BTW-nummer in; leverancier moet ook een BTW-id hebben.
              </span>
            )}
          </span>
        </label>
      )}
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
