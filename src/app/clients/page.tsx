import Link from 'next/link';
import { prisma } from '@/lib/db';
import ClientForm from '@/components/ClientForm';
import DeleteClientButton from '@/components/DeleteClientButton';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Klanten</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Beheer klantgegevens voor offertes en projecten.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Nieuwe klant</h2>
        <ClientForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Klanten ({clients.length})</h2>
        {clients.length === 0 ? (
          <p className="text-sm text-zinc-500">Nog geen klanten.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {clients.map((c) => (
              <li key={c.id} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-zinc-500">
                      {[c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {c.address && (
                      <p className="mt-0.5 text-sm text-zinc-500">{c.address}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400">
                      {c._count.projects} project(en)
                    </p>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-zinc-600">Bewerken</summary>
                    <div className="mt-3 rounded border border-zinc-200 bg-zinc-50 p-3">
                      <ClientForm client={c} />
                      {c._count.projects === 0 && (
                        <div className="mt-2 border-t border-zinc-200 pt-2">
                          <DeleteClientButton id={c.id} name={c.name} />
                        </div>
                      )}
                      {c._count.projects > 0 && (
                        <p className="mt-2 border-t border-zinc-200 pt-2 text-xs text-zinc-500">
                          Verwijderen kan alleen als er geen projecten gekoppeld zijn.
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-zinc-500">
        <Link href="/projects/new" className="font-medium text-zinc-900 underline">
          Nieuw project aanmaken
        </Link>
      </p>
    </div>
  );
}
