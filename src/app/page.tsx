import Link from 'next/link';
import { listProjects } from '@/lib/project-queries';
import StatusBadge from '@/components/StatusBadge';
import { STATUS_LABELS } from '@/lib/validators';
import { computeProjectTotals, projectToCostFields } from '@/lib/project-totals';
import { formatEur } from '@/lib/pricing';
import type { ProjectStatus } from '@/generated/prisma/client';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const projects = await listProjects(status);
  const statuses = Object.keys(STATUS_LABELS) as ProjectStatus[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Projecten</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nieuw project
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/" label="Alle" active={!status} />
        {statuses.map((s) => (
          <FilterLink
            key={s}
            href={`/?status=${s}`}
            label={STATUS_LABELS[s]}
            active={status === s}
          />
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          Nog geen projecten.{' '}
          <Link href="/projects/new" className="font-medium text-zinc-900 underline">
            Maak het eerste project aan
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {projects.map((p) => {
            const totals = computeProjectTotals(p.lines, projectToCostFields(p));
            const hasTotal = totals.grandTotal > 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-zinc-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">{p.title}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {p.client.name}
                      {p.location ? ` · ${p.location}` : ''}
                      {p.quoteNumber ? ` · ${p.quoteNumber}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-zinc-700">
                    {hasTotal ? formatEur(totals.grandTotal) : '—'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100'
      }`}
    >
      {label}
    </Link>
  );
}
