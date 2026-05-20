'use client';

export default function ProjectExportButton({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  return (
    <a
      href={`/api/projects/${projectId}/export`}
      download={`${title.replace(/\s+/g, '-')}-backup.json`}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
    >
      JSON-backup
    </a>
  );
}
