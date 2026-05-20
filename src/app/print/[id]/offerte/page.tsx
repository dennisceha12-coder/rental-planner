import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl } from '@/lib/dates';
import { lineBreakdown, projectMaterialTotal, formatEur } from '@/lib/pricing';
import PrintHeader from '@/components/print/PrintHeader';
import PrintToolbar from '@/components/PrintToolbar';

export default async function OffertePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const total = projectMaterialTotal(project.lines);
  const today = new Date().toLocaleDateString('nl-NL');

  return (
    <>
      <PrintToolbar />
      <PrintHeader
        title="Offerte"
        subtitle={project.quoteNumber ?? project.title}
      />

      <section className="print-page mb-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="mb-2 font-semibold uppercase text-xs text-zinc-500">Klant</h2>
          <p className="font-medium">{project.client.name}</p>
          {project.client.address && <p>{project.client.address}</p>}
          {project.client.email && <p>{project.client.email}</p>}
          {project.client.phone && <p>{project.client.phone}</p>}
          {project.client.vatNumber && <p>BTW: {project.client.vatNumber}</p>}
        </div>
        <div>
          <h2 className="mb-2 font-semibold uppercase text-xs text-zinc-500">Project</h2>
          <p className="font-medium">{project.title}</p>
          {project.location && <p>Locatie: {project.location}</p>}
          {project.loadIn && <p>Load-in: {formatDateNl(project.loadIn)}</p>}
          {project.showDate && <p>Show: {formatDateNl(project.showDate)}</p>}
          {project.loadOut && <p>Load-out: {formatDateNl(project.loadOut)}</p>}
          <p className="mt-2 text-zinc-500">Datum offerte: {today}</p>
        </div>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-zinc-800">
            <th className="py-2 text-left">Omschrijving</th>
            <th className="py-2 text-right">Aantal</th>
            <th className="py-2 text-right">Dagen</th>
            <th className="py-2 text-right">Dagtarief</th>
            <th className="py-2 text-right">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {project.lines.map((line) => {
            const { days, total: lineTotal } = lineBreakdown(line);
            return (
              <tr key={line.id} className="border-b border-zinc-200">
                <td className="py-2">{line.equipment.name}</td>
                <td className="py-2 text-right">{line.quantity}</td>
                <td className="py-2 text-right">{days}</td>
                <td className="py-2 text-right">{formatEur(line.equipment.dailyRate)}</td>
                <td className="py-2 text-right font-medium">{formatEur(lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="pt-4 text-right font-semibold">
              Totaal excl. BTW
            </td>
            <td className="pt-4 text-right text-lg font-bold">{formatEur(total)}</td>
          </tr>
        </tfoot>
      </table>

      {project.notes && (
        <section className="mt-8 text-sm">
          <h2 className="mb-1 font-semibold">Opmerkingen</h2>
          <p className="whitespace-pre-wrap">{project.notes}</p>
        </section>
      )}

      <p className="mt-8 text-xs text-zinc-500">
        Deze offerte is 30 dagen geldig. Prijzen in EUR, exclusief BTW tenzij anders vermeld.
      </p>
    </>
  );
}
