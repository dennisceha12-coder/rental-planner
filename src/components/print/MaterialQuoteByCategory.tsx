import { Fragment } from 'react';
import { groupProjectLinesByCategory } from '@/lib/equipment-categories';
import {
  lineBreakdown,
  formatEur,
  projectLineName,
  projectLineDailyRate,
  formatDiscountLabel,
  formatStaffelFactor,
  DEFAULT_RENTAL_STAFFEL,
  type ProjectLineRecord,
  type RentalStaffel,
} from '@/lib/pricing';

export default function MaterialQuoteByCategory({
  lines,
  staffel = DEFAULT_RENTAL_STAFFEL,
}: {
  lines: ProjectLineRecord[];
  staffel?: RentalStaffel;
}) {
  const groups = groupProjectLinesByCategory(lines);
  if (groups.length === 0) return null;

  return (
    <>
      <h2 className="mb-3 text-sm font-semibold">Materiaal</h2>
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col />
          <col className="w-16" />
          <col className="w-20" />
          <col className="w-32" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-zinc-800">
            <th className="py-2 pr-3 text-left font-medium">Omschrijving</th>
            <th className="py-2 text-right font-medium">Aantal</th>
            <th className="py-2 text-right font-medium">Staffel</th>
            <th className="py-2 text-right font-medium">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              <tr className="border-b border-zinc-300">
                <td colSpan={4} className="pb-1 pt-4 text-sm font-semibold">
                  {group.name}
                </td>
              </tr>
              {group.items.map((line) => {
                const { factor, gross, discount, total: lineTotal } = lineBreakdown(line, staffel);
                const discountLabel = formatDiscountLabel(line);
                const rate = projectLineDailyRate(line);
                return (
                  <tr key={line.id} className="border-b border-zinc-200 align-top">
                    <td className="py-2 pr-3">
                      <div>{projectLineName(line)}</div>
                      <div className="text-xs text-zinc-500">
                        {rate === 0 ? 'Gratis' : `${formatEur(rate)}/dag`}
                      </div>
                      {discount > 0 && discountLabel && (
                        <div className="text-xs text-zinc-500">
                          Korting: {discountLabel} (−{formatEur(discount)})
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-2 text-right tabular-nums">{line.quantity}</td>
                    <td className="whitespace-nowrap py-2 text-right tabular-nums">
                      {formatStaffelFactor(factor)}
                    </td>
                    <td className="whitespace-nowrap py-2 text-right font-medium tabular-nums">
                      {discount > 0 ? (
                        <>
                          <span className="font-normal text-zinc-400 line-through">{formatEur(gross)}</span>{' '}
                          {formatEur(lineTotal)}
                        </>
                      ) : (
                        formatEur(lineTotal)
                      )}
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}
