import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/project-queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    project,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="project-${id}.json"`,
    },
  });
}
