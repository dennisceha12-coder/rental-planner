import { groupProjectLinesByCategory } from '@/lib/equipment-categories';
import {
  lineBreakdown,
  formatEur,
  formatDailyRate,
  projectLineName,
  projectLineDailyRate,
  formatDiscountLabel,
  type ProjectLineRecord,
} from '@/lib/pricing';

export default function MaterialQuoteByCategory({ lines }: { lines: ProjectLineRecord[] }) {
  const groups = groupProjectLinesByCategory(lines);
  if (groups.length === 0) return null;

  return (
    <>
      <h2 className="mb-4 text-sm font-semibold">Materiaal</h2>
      {groups.map((group) => (
        <section key={group.key} className="mb-6">
          <h3 className="mb-2 border-b border-zinc-400 text-base font-semibold">{group.name}</h3>
          <table className="w-full border-collapse text-sm">
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
              {group.items.map((line) => {
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
                    <td className="py-2 text-right">
                      {formatDailyRate(projectLineDailyRate(line))}
                    </td>
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
        </section>
      ))}
    </>
  );
}
