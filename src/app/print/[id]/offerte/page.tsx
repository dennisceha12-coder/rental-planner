import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/project-queries';
import { formatDateNl } from '@/lib/dates';
import { lineBreakdown, formatEur, projectLineName, projectLineDailyRate, formatDiscountLabel } from '@/lib/pricing';
import {
  computeProjectTotals,
  quoteExtraLines,
  projectToCostFields,
} from '@/lib/project-totals';
import {
  getCompanySettings,
  isCompanyConfigured,
  quoteValidUntil,
  computeVatTotals,
} from '@/lib/company-settings';
import PrintHeader from '@/components/print/PrintHeader';
import PrintToolbar from '@/components/PrintToolbar';

export default async function OffertePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, company] = await Promise.all([getProjectById(id), getCompanySettings()]);
  if (!project) notFound();

  const costs = projectToCostFields(project);
  const totals = computeProjectTotals(project.lines, costs);
  const extraLines = quoteExtraLines(costs);
  const today = new Date();
  const quoteDate = today.toLocaleDateString('nl-NL');
  const validUntil = quoteValidUntil(today, company.quoteValidityDays).toLocaleDateString('nl-NL');
  const vat = computeVatTotals(totals.grandTotal, company.defaultVatRate);
  const supplierConfigured = isCompanyConfigured(company);

  return (
    <>
      <PrintToolbar />
      {!supplierConfigured && (
        <p className="no-print mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Bedrijfsgegevens niet compleet — vul in via Instellingen → Bedrijf.
        </p>
      )}
      <PrintHeader
        title="Offerte"
        subtitle={project.quoteNumber ?? project.title}
      />

      <p className="mb-4 text-sm text-zinc-600">
        Offertedatum: {quoteDate} · Geldig tot: {validUntil}
      </p>

      <section className="print-page mb-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="mb-2 font-semibold uppercase text-xs text-zinc-500">Leverancier</h2>
          {supplierConfigured ? (
            <>
              <p className="font-medium">{company.companyName}</p>
              <p className="whitespace-pre-wrap">{company.address}</p>
              {company.email && <p>{company.email}</p>}
              {company.phone && <p>{company.phone}</p>}
              {company.kvkNumber && <p>KvK: {company.kvkNumber}</p>}
              {company.vatNumber && <p>BTW: {company.vatNumber}</p>}
              {company.iban && <p>IBAN: {company.iban}</p>}
            </>
          ) : (
            <p className="text-zinc-500 italic">Nog niet ingevuld</p>
          )}
        </div>
        <div>
          <h2 className="mb-2 font-semibold uppercase text-xs text-zinc-500">Klant</h2>
          <p className="font-medium">{project.client.name}</p>
          {project.client.address && <p>{project.client.address}</p>}
          {project.client.email && <p>{project.client.email}</p>}
          {project.client.phone && <p>{project.client.phone}</p>}
          {project.client.vatNumber && <p>BTW: {project.client.vatNumber}</p>}
        </div>
      </section>

      <section className="mb-6 text-sm">
        <h2 className="mb-1 font-semibold uppercase text-xs text-zinc-500">Project</h2>
        <p className="font-medium">{project.title}</p>
        {project.location && <p>Locatie: {project.location}</p>}
        {project.loadIn && (
          <p>
            Opbouw: {formatDateNl(project.loadIn)}
            {project.loadInTime ? ` ${project.loadInTime}` : ''}
          </p>
        )}
        {project.showDate && <p>Show: {formatDateNl(project.showDate)}</p>}
        {project.loadOut && (
          <p>
            Afbouw: {formatDateNl(project.loadOut)}
            {project.loadOutTime ? ` ${project.loadOutTime}` : ''}
          </p>
        )}
      </section>

      {project.lines.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold">Materiaal</h2>
          <table className="mb-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-zinc-800">
                <th className="py-2 text-left">Omschrijving</th>
                <th className="py-2 text-right">Aantal</th>
                <th className="py-2 text-right">Dagen</th>
                <th className="py-2 text-right">Dagtarief</th>
                <th className="py-2 text-right">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {project.lines.map((line) => {
                const { days, gross, discount, total: lineTotal } = lineBreakdown(line);
                const discountLabel = formatDiscountLabel(line);
                return (
                  <tr key={line.id} className="border-b border-zinc-200">
                    <td className="py-2">
                      {projectLineName(line)}
                      {discount > 0 && discountLabel && (
                        <div className="text-xs text-zinc-500">
                          Korting: {discountLabel} (−{formatEur(discount)})
                        </div>
                      )}
                    </td>
                    <td className="py-2 text-right">{line.quantity}</td>
                    <td className="py-2 text-right">{days}</td>
                    <td className="py-2 text-right">{formatEur(projectLineDailyRate(line))}</td>
                    <td className="py-2 text-right font-medium">
                      {discount > 0 ? (
                        <>
                          <span className="text-zinc-400 line-through">{formatEur(gross)}</span>{' '}
                          {formatEur(lineTotal)}
                        </>
                      ) : (
                        formatEur(lineTotal)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {extraLines.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold">Personeel & transport</h2>
          <table className="mb-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-zinc-800">
                <th className="py-2 text-left">Omschrijving</th>
                <th className="py-2 text-right">Aantal</th>
                <th className="py-2 text-right">Eenheid</th>
                <th className="py-2 text-right">Tarief</th>
                <th className="py-2 text-right">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {extraLines.map((row) => (
                <tr key={row.key} className="border-b border-zinc-200">
                  <td className="py-2">
                    <div>{row.label}</div>
                    {row.detail && (
                      <div className="mt-0.5 text-xs text-zinc-500">{row.detail}</div>
                    )}
                  </td>
                  <td className="py-2 text-right tabular-nums">{row.quantity}</td>
                  <td className="py-2 text-right">{row.unit}</td>
                  <td className="py-2 text-right">
                    {formatEur(row.unitRate)}/{row.unit}
                  </td>
                  <td className="py-2 text-right font-medium">{formatEur(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <table className="ml-auto w-full max-w-sm border-collapse text-sm">
        <tbody>
          {totals.material > 0 && (
            <tr>
              <td className="py-1 text-right text-zinc-600">Subtotaal materiaal</td>
              <td className="py-1 pl-4 text-right tabular-nums">{formatEur(totals.material)}</td>
            </tr>
          )}
          {totals.labor > 0 && (
            <tr>
              <td className="py-1 text-right text-zinc-600">Subtotaal personeel</td>
              <td className="py-1 pl-4 text-right tabular-nums">{formatEur(totals.labor)}</td>
            </tr>
          )}
          {totals.transport > 0 && (
            <tr>
              <td className="py-1 text-right text-zinc-600">Transport</td>
              <td className="py-1 pl-4 text-right tabular-nums">{formatEur(totals.transport)}</td>
            </tr>
          )}
          {totals.lineDiscountTotal > 0 && (
            <tr>
              <td className="py-1 text-right text-zinc-600">Korting materiaalregels</td>
              <td className="py-1 pl-4 text-right tabular-nums text-red-700">
                −{formatEur(totals.lineDiscountTotal)}
              </td>
            </tr>
          )}
          {totals.totalDiscountAmount > 0 && (
            <tr>
              <td className="py-1 text-right text-zinc-600">Korting op totaal</td>
              <td className="py-1 pl-4 text-right tabular-nums text-red-700">
                −{formatEur(totals.totalDiscountAmount)}
              </td>
            </tr>
          )}
          <tr className="border-t border-zinc-300">
            <td className="pt-2 text-right font-medium">Totaal excl. BTW</td>
            <td className="pt-2 pl-4 text-right font-medium tabular-nums">
              {formatEur(vat.subtotalExclVat)}
            </td>
          </tr>
          <tr>
            <td className="py-1 text-right text-zinc-600">BTW ({company.defaultVatRate}%)</td>
            <td className="py-1 pl-4 text-right tabular-nums">{formatEur(vat.vatAmount)}</td>
          </tr>
          <tr className="border-t-2 border-zinc-800">
            <td className="pt-3 text-right font-semibold">Totaal incl. BTW</td>
            <td className="pt-3 pl-4 text-right text-lg font-bold tabular-nums">
              {formatEur(vat.totalInclVat)}
            </td>
          </tr>
        </tbody>
      </table>

      {project.notes && (
        <section className="mt-8 text-sm">
          <h2 className="mb-1 font-semibold">Opmerkingen</h2>
          <p className="whitespace-pre-wrap">{project.notes}</p>
        </section>
      )}

      <footer className="mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-600">
        {company.paymentTerms && <p>Betalingsvoorwaarden: {company.paymentTerms}</p>}
        <p className="mt-1">
          Deze offerte is {company.quoteValidityDays} dagen geldig (tot {validUntil}). Prijzen in EUR.
        </p>
      </footer>
    </>
  );
}
