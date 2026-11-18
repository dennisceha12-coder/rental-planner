'use client';

export default function PrintToolbar({ pdfHref }: { pdfHref?: string }) {
  return (
    <div className="no-print mb-6 flex gap-3">
      {pdfHref ? (
        <a
          href={pdfHref}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Opslaan als PDF
        </a>
      ) : (
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Afdrukken / PDF
        </button>
      )}
    </div>
  );
}
