import Link from 'next/link';

const links = [
  { href: '/', label: 'Projecten' },
  { href: '/catalog', label: 'Catalogus' },
  { href: '/staff', label: 'Team' },
  { href: '/settings', label: 'Bedrijf' },
  { href: '/projects/new', label: 'Nieuw project' },
];

export default function Nav() {
  return (
    <nav className="no-print border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          Rental Planner
        </Link>
        <div className="flex flex-wrap gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
