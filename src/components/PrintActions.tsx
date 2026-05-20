import Link from 'next/link';

export default function PrintActions({ projectId }: { projectId: string }) {
  const base = `/print/${projectId}`;
  const items = [
    { href: `${base}/personeel`, label: 'Personeel' },
    { href: `${base}/offerte`, label: 'Offerte' },
    { href: `${base}/callsheet`, label: 'Callsheet' },
    { href: `${base}/materiaallijst`, label: 'Materiaallijst' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          target="_blank"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          {item.label} ↗
        </Link>
      ))}
      <p className="w-full text-xs text-zinc-500">
        Opent printweergave — gebruik Ctrl+P / Cmd+P om als PDF op te slaan.
      </p>
    </div>
  );
}
