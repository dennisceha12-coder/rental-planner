export function computeVatTotals(subtotalExclVat: number, vatRatePercent: number) {
  const vatAmount = subtotalExclVat * (vatRatePercent / 100);
  return {
    subtotalExclVat,
    vatRatePercent,
    vatAmount,
    totalInclVat: subtotalExclVat + vatAmount,
  };
}
