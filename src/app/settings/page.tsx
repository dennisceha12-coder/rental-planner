import { getCompanySettings, isCompanyConfigured } from '@/lib/company-settings';
import CompanySettingsForm from '@/components/CompanySettingsForm';

export default async function SettingsPage() {
  const settings = await getCompanySettings();
  const configured = isCompanyConfigured(settings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bedrijfsgegevens</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Deze gegevens verschijnen op offertes als leverancier (KvK, BTW, IBAN).
        </p>
      </div>
      {!configured && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Vul bedrijfsnaam en adres in — offertes tonen anders een placeholder bij leverancier.
        </p>
      )}
      <CompanySettingsForm settings={settings} />
    </div>
  );
}
