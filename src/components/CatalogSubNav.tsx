'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/catalog/materiaal', label: 'Materiaal', match: ['/catalog', '/catalog/materiaal'] },
  { href: '/catalog/categorieen', label: 'Categorieën', match: ['/catalog/categorieen'] },
] as const;

export default function CatalogSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-zinc-200">
      {tabs.map((tab) => {
        const active = (tab.match as readonly string[]).includes(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              active
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
