import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getProjectById } from '@/lib/project-queries';
import { toDateInputValue } from '@/lib/dates';
import StatusBadge from '@/components/StatusBadge';
import ProjectForm from '@/components/ProjectForm';
import ProjectLinesSection from '@/components/ProjectLinesSection';
import PrintActions from '@/components/PrintActions';
import ProjectExportButton from '@/components/ProjectExportButton';
import ProjectCostSummary from '@/components/ProjectCostSummary';
import CrewPlanningSection from '@/components/CrewPlanningSection';
import { projectToCostFields } from '@/lib/project-totals';
import { mapCrewShiftFromDb } from '@/lib/crew';
import DeleteProjectButton from '@/components/DeleteProjectButton';

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [clients, equipment, staffList] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
    prisma.equipment.findMany({ orderBy: { name: 'asc' } }),
    prisma.staff.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const activeTab =
    tab === 'materiaal' || tab === 'personeel' || tab === 'documenten' ? tab : 'algemeen';
  const defaultStart = toDateInputValue(project.loadIn ?? project.showDate);
  const defaultEnd = toDateInputValue(project.loadOut ?? project.showDate);
  const defaultCrewDate = toDateInputValue(project.loadIn ?? project.showDate);

  const tabs = [
    { key: 'algemeen', label: 'Algemeen' },
    { key: 'personeel', label: 'Personeel' },
    { key: 'materiaal', label: 'Materiaal' },
    { key: 'documenten', label: 'Documenten' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
            ← Klussen
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {project.client.name}
            {project.quoteNumber ? ` · ${project.quoteNumber}` : ''}
          </p>
        </div>
        <ProjectExportButton projectId={project.id} title={project.title} />
      </div>

      <ProjectCostSummary
        lines={project.lines}
        costs={projectToCostFields(project)}
      />

      <div className="flex gap-1 border-b border-zinc-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/projects/${id}?tab=${t.key}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === t.key
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === 'algemeen' && (
        <div className="space-y-4">
          <ProjectForm clients={clients} project={project} />
          <DeleteProjectButton id={project.id} />
        </div>
      )}

      {activeTab === 'personeel' && (
        <CrewPlanningSection
          projectId={project.id}
          shifts={project.crewShifts.map((s) => ({
            ...mapCrewShiftFromDb(s),
            assignedStaffIds: s.staffAssignments.map((a) => a.staffId),
          }))}
          staff={staffList}
          defaultHourlyRate={project.hourlyRate}
          defaultDate={defaultCrewDate}
          defaultStartTime={project.loadInTime ?? '08:00'}
          defaultEndTime={project.loadOutTime ?? '17:00'}
        />
      )}

      {activeTab === 'materiaal' && (
        <ProjectLinesSection
          projectId={project.id}
          lines={project.lines.map((l) => ({
            ...l,
            equipmentId: l.equipmentId,
            projectId: l.projectId,
          }))}
          equipment={equipment}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
        />
      )}

      {activeTab === 'documenten' && (
        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium">Documenten</h2>
          <PrintActions projectId={project.id} />
        </section>
      )}
    </div>
  );
}
