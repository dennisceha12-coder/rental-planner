import CatalogSubNav from '@/components/CatalogSubNav';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Catalogus</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Beheer materiaal en categorieën via een vaste lijst — geen vrije tekst meer.
        </p>
      </div>
      <CatalogSubNav />
      {children}
    </div>
  );
}
