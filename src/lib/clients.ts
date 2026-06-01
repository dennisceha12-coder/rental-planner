import type { ClientType } from '@/generated/prisma/client';

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  PARTICULIER: 'Particulier',
  BEDRIJF: 'Bedrijf',
};

export function clientDisplayName(name: string, type: ClientType): string {
  return `${name} (${CLIENT_TYPE_LABELS[type]})`;
}
