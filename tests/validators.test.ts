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
});
