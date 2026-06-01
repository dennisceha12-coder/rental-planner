'use client';

export default function ProjectSearchForm({ defaultQuery }: { defaultQuery: string }) {
  return (
    <form method="get" className="flex flex-wrap gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Zoek op titel, klant, locatie, offertenummer…"
        className="min-w-[16rem] flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        Zoeken
      </button>
    </form>
  );
}
