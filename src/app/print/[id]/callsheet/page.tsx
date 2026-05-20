import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl } from '@/lib/dates';
import { CREW_PHASE_LABELS, formatStaffLabel, mapCrewShiftFromDb } from '@/lib/crew';
import PrintHeader from '@/components/print/PrintHeader';
import PrintToolbar from '@/components/PrintToolbar';

export default async function CallsheetPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <>
      <PrintToolbar />
      <PrintHeader title="Callsheet" subtitle={project.title} />

      <section className="print-page space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Klant" value={project.client.name} />
          <Field label="Offerte / ref." value={project.quoteNumber} />
          <Field label="Locatie" value={project.location} />
          <Field label="Contact op locatie" value={project.siteContact} />
        </div>

        <h2 className="border-b border-zinc-300 pb-1 pt-4 text-base font-semibold">
          Tijdlijn
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <ScheduleRow
              label="Load-in"
              date={project.loadIn}
              time={project.loadInTime}
            />
            <ScheduleRow label="Show" date={project.showDate} time={project.showTime} />
            <ScheduleRow
              label="Load-out"
              date={project.loadOut}
              time={project.loadOutTime}
            />
          </tbody>
        </table>

        {project.crewShifts.length > 0 && (
          <>
            <h2 className="border-b border-zinc-300 pb-1 pt-4 text-base font-semibold">
              Personeelsplanning
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500">
                  <th className="pb-2">Fase</th>
                  <th className="pb-2">Rol</th>
                  <th className="pb-2">Datum</th>
                  <th className="pb-2">Tijd</th>
                  <th className="pb-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {project.crewShifts.map((shift) => {
                  const mapped = mapCrewShiftFromDb(shift);
                  return (
                  <tr key={shift.id} className="border-b border-zinc-100">
                    <td className="py-2 font-medium">{CREW_PHASE_LABELS[shift.phase]}</td>
                    <td className="py-2">{shift.role ?? '—'}</td>
                    <td className="py-2">{formatDateNl(shift.date)}</td>
                    <td className="py-2 tabular-nums">
                      {shift.startTime}–{shift.endTime}
                    </td>
                    <td className="py-2">{formatStaffLabel(mapped)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {project.parkingNotes && (
          <>
            <h2 className="border-b border-zinc-300 pb-1 pt-4 text-base font-semibold">
              Parkeren & logistiek
            </h2>
            <p className="whitespace-pre-wrap">{project.parkingNotes}</p>
          </>
        )}

        {project.notes && (
          <>
            <h2 className="border-b border-zinc-300 pb-1 pt-4 text-base font-semibold">
              Bijzonderheden
            </h2>
            <p className="whitespace-pre-wrap">{project.notes}</p>
          </>
        )}

        <h2 className="border-b border-zinc-300 pb-1 pt-4 text-base font-semibold">
          Klantcontact
        </h2>
        <p>
          {project.client.phone && <>Tel: {project.client.phone}<br /></>}
          {project.client.email}
        </p>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase text-zinc-500">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}

function ScheduleRow({
  label,
  date,
  time,
}: {
  label: string;
  date: Date | null;
  time: string | null;
}) {
  return (
    <tr className="border-b border-zinc-100">
      <td className="py-2 font-medium w-28">{label}</td>
      <td className="py-2">{formatDateNl(date)}</td>
      <td className="py-2">{time ?? '—'}</td>
    </tr>
  );
}
