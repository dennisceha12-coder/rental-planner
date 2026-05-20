import { STATUS_LABELS } from '@/lib/validators';

const styles: Record<string, string> = {
  CONCEPT: 'bg-zinc-100 text-zinc-700',
  OFFERTE: 'bg-amber-100 text-amber-800',
  BEVESTIGD: 'bg-emerald-100 text-emerald-800',
  AFGEROND: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.CONCEPT}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
