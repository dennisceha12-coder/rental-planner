import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl } from '@/lib/dates';
import PrintHeader from '@/components/print/PrintHeader';
import PrintToolbar from '@/components/PrintToolbar';

export default async function MateriaallijstPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const grouped = new Map<string, typeof project.lines>();
  for (const line of project.lines) {
    const cat = line.equipment.category ?? 'Overig';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(line);
  }

  const categories = [...grouped.keys()].sort((a, b) => a.localeCompare(b, 'nl'));

  return (
    <>
      <PrintToolbar />
      <PrintHeader
        title="Materiaallijst"
        subtitle={`${project.title} · ${formatDateNl(project.showDate ?? project.loadIn)}`}
      />

      <p className="mb-6 text-sm text-zinc-600">
        Locatie: {project.location ?? '—'} · {project.lines.length} regel(s)
      </p>

      {categories.length === 0 ? (
        <p className="text-sm text-zinc-500">Geen materiaal geboekt.</p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="print-page mb-6">
            <h2 className="mb-2 border-b border-zinc-400 text-base font-semibold">{cat}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500">
                  <th className="pb-1 w-16">Aantal</th>
                  <th className="pb-1">Artikel</th>
                  <th className="pb-1 w-8 text-center">✓</th>
                </tr>
              </thead>
              <tbody>
                {grouped.get(cat)!.map((line) => (
                  <tr key={line.id} className="border-b border-zinc-100">
                    <td className="py-2 font-bold tabular-nums">{line.quantity}×</td>
                    <td className="py-2">{line.equipment.name}</td>
                    <td className="py-2 text-center">
                      <span className="inline-block h-4 w-4 border border-zinc-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </>
  );
}
