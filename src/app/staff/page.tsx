import { prisma } from '@/lib/db';
import StaffForm from '@/components/StaffForm';
import DeleteStaffButton from '@/components/DeleteStaffButton';

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Teamleden kun je toewijzen aan shifts in de personeelsplanning per project.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Nieuw teamlid</h2>
        <StaffForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Team ({staff.length})</h2>
        {staff.length === 0 ? (
          <p className="text-sm text-zinc-500">Nog geen teamleden.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {staff.map((s) => (
              <li key={s.id} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-zinc-500">
                      {[s.role, s.phone].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-zinc-600">Bewerken</summary>
                    <div className="mt-3 rounded border border-zinc-200 bg-zinc-50 p-3">
                      <StaffForm member={s} />
                      <div className="mt-2 border-t border-zinc-200 pt-2">
                        <DeleteStaffButton id={s.id} />
                      </div>
                    </div>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
