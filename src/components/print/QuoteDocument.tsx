import path from 'path';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public/fonts/Inter-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

export type QuotePdfLine = {
  id: string;
  name: string;
  rateLabel: string;
  quantity: string;
  staffel: string;
  totalLabel: string;
  grossLabel: string | null;
  discountLabel: string | null;
};

export type QuotePdfData = {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  validityDays: number;
  company: {
    configured: boolean;
    name: string;
    address: string;
    email: string | null;
    phone: string | null;
    kvkNumber: string | null;
    vatNumber: string | null;
    iban: string | null;
    paymentTerms: string | null;
  };
  client: {
    name: string;
    typeLabel: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    vatNumber: string | null;
  };
  project: {
    title: string;
    location: string | null;
    loadIn: string | null;
    show: string | null;
    loadOut: string | null;
    notes: string | null;
  };
  materialGroups: { name: string; items: QuotePdfLine[] }[];
  staffelNote: string | null;
  extras: {
    key: string;
    label: string;
    detail: string | null;
    quantity: string;
    unit: string;
    rateLabel: string;
    totalLabel: string;
  }[];
  totals: { label: string; value: string; kind: 'normal' | 'discount' | 'subtotal' | 'grand' }[];
  reverseCharge: boolean;
  reverseChargeNoteNl: string | null;
  reverseChargeNoteEn: string | null;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#18181b',
    lineHeight: 1.35,
  },
  brand: {
    fontSize: 8,
    letterSpacing: 0.8,
    color: '#71717a',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#52525b',
  },
  meta: {
    marginTop: 10,
    marginBottom: 14,
    color: '#52525b',
  },
  columns: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  column: {
    width: '50%',
    paddingRight: 16,
  },
  label: {
    marginBottom: 3,
    fontSize: 8,
    letterSpacing: 0.6,
    color: '#71717a',
  },
  strong: {
    fontWeight: 700,
  },
  muted: {
    color: '#52525b',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#18181b',
    paddingBottom: 4,
    fontWeight: 700,
  },
  category: {
    marginTop: 8,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d4d4d8',
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.4,
    borderBottomColor: '#e4e4e7',
    paddingVertical: 4,
  },
  nameCol: { flex: 1, paddingRight: 8 },
  qtyCol: { width: 46, textAlign: 'right' },
  staffelCol: { width: 52, textAlign: 'right' },
  totalCol: { width: 78, textAlign: 'right', fontWeight: 700 },
  rate: { fontSize: 8, color: '#71717a' },
  extraQty: { width: 46, textAlign: 'right' },
  extraUnit: { width: 52, textAlign: 'right' },
  extraRate: { width: 78, textAlign: 'right' },
  note: {
    marginTop: 6,
    fontSize: 8,
    color: '#71717a',
  },
  totals: {
    marginTop: 8,
    marginLeft: 'auto',
    width: 230,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.6,
    borderTopColor: '#d4d4d8',
    fontWeight: 700,
  },
  totalGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#18181b',
    fontSize: 12,
    fontWeight: 700,
  },
  discount: { color: '#b91c1c' },
  strike: {
    color: '#a1a1aa',
    textDecoration: 'line-through',
    fontWeight: 400,
  },
  footer: {
    marginTop: 18,
    fontSize: 8,
    color: '#71717a',
  },
  notes: {
    marginTop: 16,
  },
});

function Block({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <Text key={index}>{line.length > 0 ? line : ' '}</Text>
      ))}
    </>
  );
}

export default function QuoteDocument({ data }: { data: QuotePdfData }) {
  const { company, client, project } = data;

  return (
    <Document title={`Offerte ${data.quoteNumber}`} author={company.name || 'Rental Planner'}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>Rental Planner</Text>
        <Text style={styles.title}>Offerte</Text>
        <Text style={styles.subtitle}>{data.quoteNumber}</Text>
        <Text style={styles.meta}>
          Offertedatum: {data.quoteDate} · Geldig tot: {data.validUntil}
        </Text>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.label}>LEVERANCIER</Text>
            {company.configured ? (
              <>
                <Text style={styles.strong}>{company.name}</Text>
                <Block text={company.address} />
                {company.email ? <Text>{company.email}</Text> : null}
                {company.phone ? <Text>{company.phone}</Text> : null}
                {company.kvkNumber ? <Text>KvK: {company.kvkNumber}</Text> : null}
                {company.vatNumber ? <Text>BTW: {company.vatNumber}</Text> : null}
                {company.iban ? <Text>IBAN: {company.iban}</Text> : null}
              </>
            ) : (
              <Text style={styles.muted}>Nog niet ingevuld</Text>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>KLANT</Text>
            <Text style={styles.strong}>{client.name}</Text>
            <Text style={styles.muted}>{client.typeLabel}</Text>
            {client.address ? <Block text={client.address} /> : null}
            {client.email ? <Text>{client.email}</Text> : null}
            {client.phone ? <Text>{client.phone}</Text> : null}
            {client.vatNumber ? <Text>BTW: {client.vatNumber}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>PROJECT</Text>
          <Text style={styles.strong}>{project.title}</Text>
          {project.location ? <Text>Locatie: {project.location}</Text> : null}
          {project.loadIn ? <Text>{project.loadIn}</Text> : null}
          {project.show ? <Text>{project.show}</Text> : null}
          {project.loadOut ? <Text>{project.loadOut}</Text> : null}
        </View>

        {data.materialGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materiaal</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.nameCol}>Omschrijving</Text>
              <Text style={styles.qtyCol}>Aantal</Text>
              <Text style={styles.staffelCol}>Staffel</Text>
              <Text style={styles.totalCol}>Totaal</Text>
            </View>
            {data.materialGroups.map((group) => (
              <View key={group.name}>
                <Text style={styles.category}>{group.name}</Text>
                {group.items.map((item) => (
                  <View key={item.id} style={styles.row} wrap={false}>
                    <View style={styles.nameCol}>
                      <Text>{item.name}</Text>
                      <Text style={styles.rate}>{item.rateLabel}</Text>
                      {item.discountLabel ? <Text style={styles.rate}>{item.discountLabel}</Text> : null}
                    </View>
                    <Text style={styles.qtyCol}>{item.quantity}</Text>
                    <Text style={styles.staffelCol}>{item.staffel}</Text>
                    <Text style={styles.totalCol}>
                      {item.grossLabel ? <Text style={styles.strike}>{item.grossLabel} </Text> : null}
                      {item.totalLabel}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            {data.staffelNote ? <Text style={styles.note}>{data.staffelNote}</Text> : null}
          </View>
        )}

        {data.extras.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Personeel & transport</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.nameCol}>Omschrijving</Text>
              <Text style={styles.extraQty}>Aantal</Text>
              <Text style={styles.extraUnit}>Eenheid</Text>
              <Text style={styles.extraRate}>Tarief</Text>
              <Text style={styles.totalCol}>Totaal</Text>
            </View>
            {data.extras.map((row) => (
              <View key={row.key} style={styles.row} wrap={false}>
                <View style={styles.nameCol}>
                  <Text>{row.label}</Text>
                  {row.detail ? <Text style={styles.rate}>{row.detail}</Text> : null}
                </View>
                <Text style={styles.extraQty}>{row.quantity}</Text>
                <Text style={styles.extraUnit}>{row.unit}</Text>
                <Text style={styles.extraRate}>{row.rateLabel}</Text>
                <Text style={styles.totalCol}>{row.totalLabel}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.totals} wrap={false}>
          {data.totals.map((row) => (
            <View
              key={row.label}
              style={
                row.kind === 'grand' ? styles.totalGrand : row.kind === 'subtotal' ? styles.totalSub : styles.totalRow
              }
            >
              <Text style={row.kind === 'discount' ? styles.discount : undefined}>{row.label}</Text>
              <Text style={row.kind === 'discount' ? styles.discount : undefined}>{row.value}</Text>
            </View>
          ))}
        </View>

        {project.notes ? (
          <View style={styles.notes}>
            <Text style={styles.strong}>Opmerkingen</Text>
            <Text>{project.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          {company.paymentTerms ? (
            <Text>Betalingsvoorwaarden: {company.paymentTerms}</Text>
          ) : null}
          {data.reverseChargeNoteNl ? (
            <Text style={{ marginTop: 4, fontWeight: 700 }}>{data.reverseChargeNoteNl}</Text>
          ) : null}
          {data.reverseChargeNoteEn ? (
            <Text style={{ marginTop: 2 }}>{data.reverseChargeNoteEn}</Text>
          ) : null}
          <Text style={{ marginTop: 4 }}>
            Deze offerte is {data.validityDays} dagen geldig (tot {data.validUntil}). Prijzen in EUR.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
