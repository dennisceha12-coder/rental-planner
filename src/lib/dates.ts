export function parseDateInput(value: string | undefined | null): Date | null {
  if (!value || value.trim() === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateNl(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const from = start?.trim();
  const to = end?.trim();
  if (from && to) return `${from}–${to}`;
  if (from) return from;
  if (to) return `tot ${to}`;
  return '—';
}
