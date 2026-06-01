'use client';

import { useTransition } from 'react';
import { createEquipment, updateEquipment } from '@/app/actions';

type Equipment = {
  id: string;
  name: string;
  category: string | null;
  dailyRate: number;
  stockQty: number | null;
  isExternalRental: boolean;
};

export default function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(() => {
      void (async () => {
        if (equipment) {
          await updateEquipment(equipment.id, formData);
        } else {
          await createEquipment(formData);
          (document.getElementById('equipment-form') as HTMLFormElement)?.reset();
        }
      })();
    });
  }

  return (
    <form id="equipment-form" action={onSubmit} className="grid max-w-md gap-3">
      <label className="grid gap-1 text-sm">
        Naam *
        <input
          name="name"
          required
          defaultValue={equipment?.name}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Categorie
        <input
          name="category"
          defaultValue={equipment?.category ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Dagtarief (EUR) *
        <input
          name="dailyRate"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={equipment?.dailyRate}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Voorraad (leeg = onbeperkt)
        <input
          name="stockQty"
          type="number"
          min="1"
          defaultValue={equipment?.stockQty ?? ''}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isExternalRental"
          defaultChecked={equipment?.isExternalRental ?? false}
          className="rounded border-zinc-300"
        />
        Extern inhuur
      </label>
      <p className="text-xs text-zinc-500">
        Inhuurmateriaal verschijnt op de aparte inhuurlijst bij documenten.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : equipment ? 'Bijwerken' : 'Toevoegen'}
      </button>
    </form>
  );
}
