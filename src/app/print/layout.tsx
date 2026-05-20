import '../print.css';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-black print:p-0">{children}</div>;
}
