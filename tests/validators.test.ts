import { describe, expect, it } from 'vitest';
import { companySettingsSchema, equipmentSchema } from '@/lib/validators';

describe('equipmentSchema', () => {
  it('accepts unchecked external rental checkbox (FormData null)', () => {
    const result = equipmentSchema.safeParse({
      name: 'Test item',
      categoryId: undefined,
      dailyRate: '50',
      stockQty: '',
      isExternalRental: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isExternalRental).toBe(false);
      expect(result.data.stockQty).toBe('');
    }
  });

  it('accepts checked external rental checkbox', () => {
    const result = equipmentSchema.safeParse({
      name: 'Test item',
      dailyRate: '50',
      stockQty: '2',
      isExternalRental: 'on',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isExternalRental).toBe(true);
      expect(result.data.stockQty).toBe(2);
    }
  });

  it('accepts zero daily rate for free catalog items', () => {
    const result = equipmentSchema.safeParse({
      name: 'Verlengkabel',
      dailyRate: '0',
      stockQty: '',
      isExternalRental: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dailyRate).toBe(0);
    }
  });

  it('rejects negative daily rate', () => {
    const result = equipmentSchema.safeParse({
      name: 'Test item',
      dailyRate: '-5',
      stockQty: '',
      isExternalRental: null,
    });

    expect(result.success).toBe(false);
  });
});

describe('companySettingsSchema', () => {
  const base = {
    companyName: 'Studio',
    address: 'Straat 1',
    email: '',
    phone: '',
    kvkNumber: '',
    vatNumber: '',
    iban: '',
    quoteValidityDays: '30',
    defaultVatRate: '21',
    paymentTerms: '',
  };

  it('accepts a rental staffel', () => {
    const result = companySettingsSchema.safeParse({
      ...base,
      rentalStaffelPercents: ['100', '50', '25'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rentalStaffelPercents).toEqual([100, 50, 25]);
    }
  });

  it('rejects a staffel percentage above 100', () => {
    const result = companySettingsSchema.safeParse({
      ...base,
      rentalStaffelPercents: ['100', '150'],
    });
    expect(result.success).toBe(false);
  });
});
