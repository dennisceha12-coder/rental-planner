export type VatMode = 'STANDARD' | 'REVERSE_CHARGE';

export type VatTotals = {
  subtotalExclVat: number;
  vatRatePercent: number;
  vatAmount: number;
  totalInclVat: number;
  mode: VatMode;
  reverseCharge: boolean;
};

/**
 * Legal mention required on a Dutch VAT invoice when intra-EU B2B reverse charge applies.
 * Wet OB 1968 art. 35a lid 1 sub n / Directive 2006/112/EC art. 226.
 */
export const REVERSE_CHARGE_NOTE_NL =
  'BTW verlegd — intracommunautaire dienst, art. 44 en 196 Richtlijn 2006/112/EG.';

export const REVERSE_CHARGE_NOTE_EN =
  'Reverse charge — intra-Community supply of services, art. 44 and 196 of Directive 2006/112/EC.';

export function computeVatTotals(
  subtotalExclVat: number,
  vatRatePercent: number,
  mode: VatMode = 'STANDARD'
): VatTotals {
  if (mode === 'REVERSE_CHARGE') {
    return {
      subtotalExclVat,
      vatRatePercent,
      vatAmount: 0,
      totalInclVat: subtotalExclVat,
      mode,
      reverseCharge: true,
    };
  }
  const vatAmount = subtotalExclVat * (vatRatePercent / 100);
  return {
    subtotalExclVat,
    vatRatePercent,
    vatAmount,
    totalInclVat: subtotalExclVat + vatAmount,
    mode,
    reverseCharge: false,
  };
}
