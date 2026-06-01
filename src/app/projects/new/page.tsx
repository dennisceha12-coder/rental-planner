import { prisma } from '@/lib/db';
import { generateQuoteNumber } from '@/lib/quotes';
import ProjectForm from '@/components/ProjectForm';

export default async function NewProjectPage() {
  const [clients, quoteNumber] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
    generateQuoteNumber(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nieuw project</h1>
      <ProjectForm clients={clients} defaultQuoteNumber={quoteNumber} />
    </div>
  );
}
