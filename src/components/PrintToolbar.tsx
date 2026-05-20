'use client';

export default function PrintToolbar() {
  return (
    <div className="no-print mb-6 flex gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Afdrukken / PDF
      </button>
    </div>
  );
}
