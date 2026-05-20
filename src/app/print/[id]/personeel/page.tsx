import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl } from '@/lib/dates';
import { CREW_PHASE_LABELS, formatStaffLabel, mapCrewShiftFromDb } from '@/lib/crew';
import PrintHeader from '@/components/print/PrintHeader';
import PrintToolbar from '@/components/PrintToolbar';

export default async function PersoneelPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const shifts = project.crewShifts.map(mapCrewShiftFromDb);

  return (
    <>
      <PrintToolbar />
      <PrintHeader title="Personeelsplanning" subtitle={project.title} />

      <p className="mb-6 text-sm text-zinc-600">
        {project.location && <>Locatie: {project.location} · </>}
        {shifts.length} shift(s)
      </p>

      {shifts.length === 0 ? (
        <p className="text-sm text-zinc-500">Geen personeelsplanning ingevuld.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-800 text-left">
              <th className="py-2">Datum</th>
              <th className="py-2">Fase</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Tijd</th>
              <th className="py-2">Team</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id} className="border-b border-zinc-200">
                <td className="py-2">{formatDateNl(shift.date)}</td>
                <td className="py-2 font-medium">{CREW_PHASE_LABELS[shift.phase]}</td>
                <td className="py-2">{shift.role ?? '—'}</td>
                <td className="py-2 tabular-nums">
                  {shift.startTime}–{shift.endTime}
                </td>
                <td className="py-2">{formatStaffLabel(shift)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
