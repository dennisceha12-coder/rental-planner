import { createElement, type ReactElement } from 'react';
import { notFound } from 'next/navigation';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import QuoteDocument, { type QuotePdfData } from '@/components/print/QuoteDocument';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl, formatTimeRange } from '@/lib/dates';
import {
  chargesFullDailyRate,
  formatDiscountLabel,
  formatEur,
  formatStaffelFactor,
  formatStaffelRule,
  lineBreakdown,
  projectLineDailyRate,
  projectLineName,
  rentalDays,
} from '@/lib/pricing';
import { groupProjectLinesByCategory } from '@/lib/equipment-categories';
import {
  computeProjectTotals,
  projectToCostFields,
  quoteExtraLines,
} from '@/lib/project-totals';
import {
  computeVatTotals,
  getCompanySettings,
  isCompanyConfigured,
  quoteValidUntil,
} from '@/lib/company-settings';
import { REVERSE_CHARGE_NOTE_EN, REVERSE_CHARGE_NOTE_NL } from '@/lib/vat';
import { CLIENT_TYPE_LABELS } from '@/lib/clients';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatQty(value: number): string {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 }).format(value);
}

function phaseLine(
  label: string,
  date: Date | null,
  start: string | null,
  end: string | null
): string | null {
  if (!date) return null;
  const time = start || end ? ` · ${formatTimeRange(start, end)}` : '';
  return `${label}: ${formatDateNl(date)}${time}`;
}

function pdfFilename(quoteNumber: string): string {
  const safe = quoteNumber.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `Offerte-${safe || 'offerte'}.pdf`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [project, company] = await Promise.all([getProjectById(id), getCompanySettings()]);
  if (!project) notFound();

  const costs = projectToCostFields(project);
  const staffel = company.rentalStaffelPercents;
  const totals = computeProjectTotals(project.lines, costs, staffel);
  const staffelApplies = project.lines.some(
    (line) => !chargesFullDailyRate(rentalDays(line.rentalStart, line.rentalEnd), staffel)
  );
  const today = new Date();
  const validUntil = quoteValidUntil(today, company.quoteValidityDays);
  const vatMode = project.vatReverseCharge ? 'REVERSE_CHARGE' : 'STANDARD';
  const vat = computeVatTotals(totals.grandTotal, company.defaultVatRate, vatMode);

  const totalRows: QuotePdfData['totals'] = [];
  if (totals.material > 0) {
    totalRows.push({ label: 'Subtotaal materiaal', value: formatEur(totals.material), kind: 'normal' });
  }
  if (totals.labor > 0) {
    totalRows.push({ label: 'Subtotaal personeel', value: formatEur(totals.labor), kind: 'normal' });
  }
  if (totals.transport > 0) {
    totalRows.push({ label: 'Transport', value: formatEur(totals.transport), kind: 'normal' });
  }
  if (totals.lineDiscountTotal > 0) {
    totalRows.push({
      label: 'Korting materiaalregels',
      value: `−${formatEur(totals.lineDiscountTotal)}`,
      kind: 'discount',
    });
  }
  if (totals.totalDiscountAmount > 0) {
    totalRows.push({
      label: 'Korting op totaal',
      value: `−${formatEur(totals.totalDiscountAmount)}`,
      kind: 'discount',
    });
  }
  totalRows.push(
    { label: 'Totaal excl. BTW', value: formatEur(vat.subtotalExclVat), kind: 'subtotal' },
    {
      label: vat.reverseCharge ? 'BTW verlegd' : `BTW (${company.defaultVatRate}%)`,
      value: vat.reverseCharge ? '€ 0,00' : formatEur(vat.vatAmount),
      kind: 'normal',
    },
    {
      label: vat.reverseCharge ? 'Totaal te betalen' : 'Totaal incl. BTW',
      value: formatEur(vat.totalInclVat),
      kind: 'grand',
    }
  );

  const data: QuotePdfData = {
    quoteNumber: project.quoteNumber ?? project.title,
    quoteDate: today.toLocaleDateString('nl-NL'),
    validUntil: validUntil.toLocaleDateString('nl-NL'),
    validityDays: company.quoteValidityDays,
    company: {
      configured: isCompanyConfigured(company),
      name: company.companyName,
      address: company.address,
      email: company.email,
      phone: company.phone,
      kvkNumber: company.kvkNumber,
      vatNumber: company.vatNumber,
      iban: company.iban,
      paymentTerms: company.paymentTerms,
    },
    client: {
      name: project.client.name,
      typeLabel: CLIENT_TYPE_LABELS[project.client.type],
      address: project.client.address,
      email: project.client.email,
      phone: project.client.phone,
      vatNumber: project.client.vatNumber,
    },
    project: {
      title: project.title,
      location: project.location,
      loadIn: phaseLine('Opbouw', project.loadIn, project.loadInTime, project.loadInEndTime),
      show: phaseLine('Show', project.showDate, project.showTime, project.showEndTime),
      loadOut: phaseLine('Afbouw', project.loadOut, project.loadOutTime, project.loadOutEndTime),
      notes: project.notes,
    },
    materialGroups: groupProjectLinesByCategory(project.lines).map((group) => ({
      name: group.name,
      items: group.items.map((line) => {
        const breakdown = lineBreakdown(line, staffel);
        const discountLabel = formatDiscountLabel(line);
        const rate = projectLineDailyRate(line);
        return {
          id: line.id,
          name: projectLineName(line),
          rateLabel: rate === 0 ? 'Gratis' : `${formatEur(rate)}/dag`,
          quantity: formatQty(line.quantity),
          staffel: formatStaffelFactor(breakdown.factor),
          totalLabel: formatEur(breakdown.total),
          grossLabel: breakdown.discount > 0 ? formatEur(breakdown.gross) : null,
          discountLabel:
            breakdown.discount > 0 && discountLabel
              ? `Korting: ${discountLabel} (−${formatEur(breakdown.discount)})`
              : null,
        };
      }),
    })),
    staffelNote: staffelApplies
      ? `Meerdaagse huur volgt een staffel: ${formatStaffelRule(staffel)}.`
      : null,
    extras: quoteExtraLines(costs).map((row) => ({
      key: row.key,
      label: row.label,
      detail: row.detail ?? null,
      quantity: formatQty(row.quantity),
      unit: row.unit,
      rateLabel: formatEur(row.unitRate),
      totalLabel: formatEur(row.total),
    })),
    totals: totalRows,
    reverseCharge: vat.reverseCharge,
    reverseChargeNoteNl: vat.reverseCharge ? REVERSE_CHARGE_NOTE_NL : null,
    reverseChargeNoteEn: vat.reverseCharge ? REVERSE_CHARGE_NOTE_EN : null,
  };

  const buffer = await renderToBuffer(
    createElement(QuoteDocument, { data }) as ReactElement<DocumentProps>
  );
  const filename = pdfFilename(data.quoteNumber);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
