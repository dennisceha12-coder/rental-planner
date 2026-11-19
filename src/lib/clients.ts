import type { ClientType } from '@/generated/prisma/client';

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  PARTICULIER: 'Particulier',
  BEDRIJF: 'Bedrijf',
};

export function clientDisplayName(name: string, type: ClientType): string {
  return `${name} (${CLIENT_TYPE_LABELS[type]})`;
}

/**
 * EU/EEA member states (excluding NL) that qualify for the intra-Community
 * reverse charge under Directive 2006/112/EC. GB is non-EU since Brexit.
 */
export const EU_COUNTRY_CODES = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
] as const;

export type EuCountryCode = (typeof EU_COUNTRY_CODES)[number];

export const COUNTRY_LABELS: Record<string, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
  FR: 'Frankrijk',
  LU: 'Luxemburg',
  AT: 'Oostenrijk',
  BG: 'Bulgarije',
  CY: 'Cyprus',
  CZ: 'Tsjechië',
  DK: 'Denemarken',
  EE: 'Estland',
  ES: 'Spanje',
  FI: 'Finland',
  GR: 'Griekenland',
  HR: 'Kroatië',
  HU: 'Hongarije',
  IE: 'Ierland',
  IT: 'Italië',
  LT: 'Litouwen',
  LV: 'Letland',
  MT: 'Malta',
  PL: 'Polen',
  PT: 'Portugal',
  RO: 'Roemenië',
  SE: 'Zweden',
  SI: 'Slovenië',
  SK: 'Slowakije',
  GB: 'Verenigd Koninkrijk',
  OTHER: 'Overig',
};

/** Country codes offered in the client form, sorted NL first, then EU alphabetical, then Overig. */
export const CLIENT_COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'NL', label: COUNTRY_LABELS.NL },
  ...[...EU_COUNTRY_CODES]
    .sort((a, b) => COUNTRY_LABELS[a].localeCompare(COUNTRY_LABELS[b], 'nl'))
    .map((code) => ({ code, label: COUNTRY_LABELS[code] })),
  { code: 'OTHER', label: COUNTRY_LABELS.OTHER },
];

export function countryLabel(code: string | null | undefined): string {
  if (!code) return COUNTRY_LABELS.NL;
  return COUNTRY_LABELS[code] ?? code;
}

export function isEuCountry(code: string | null | undefined): boolean {
  if (!code) return false;
  return (EU_COUNTRY_CODES as readonly string[]).includes(code);
}
