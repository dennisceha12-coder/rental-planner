import { describe, expect, it } from 'vitest';
import { equipmentSchema } from '@/lib/validators';

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
