export default function PrintHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="print-page mb-8 border-b border-zinc-300 pb-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">Rental Planner</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
    </header>
  );
}
