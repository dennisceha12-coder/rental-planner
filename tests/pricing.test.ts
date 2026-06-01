import { describe, expect, it } from 'vitest';
import {
  computeDiscountAmount,
  lineBreakdown,
  lineNetTotal,
  projectLineDiscountTotal,
  projectMaterialTotal,
  rentalDays,
} from '@/lib/pricing';

const start = new Date('2026-06-01');
const end = new Date('2026-06-03');

const baseLine = {
  id: 'line-1',
  quantity: 2,
  rentalStart: start,
  rentalEnd: end,
  equipmentId: 'eq-1',
  customName: null,
  customDailyRate: null,
  discountType: null as const,
  discountValue: null,
  equipment: {
    id: 'eq-1',
    name: 'Speaker',
    dailyRate: 100,
    stockQty: 10,
    isExternalRental: false,
    category: null,
  },
};

describe('pricing', () => {
  it('counts rental days inclusively', () => {
    expect(rentalDays(start, end)).toBe(3);
  });

  it('applies percentage line discount', () => {
    const line = {
      ...baseLine,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
    };
    expect(lineNetTotal(line)).toBe(540);
    expect(lineBreakdown(line).discount).toBe(60);
  });

  it('applies fixed amount line discount capped at gross', () => {
    const line = {
      ...baseLine,
      discountType: 'AMOUNT' as const,
      discountValue: 999,
    };
    expect(lineNetTotal(line)).toBe(0);
  });

  it('sums material totals after line discounts', () => {
    const lines = [
      baseLine,
      {
        ...baseLine,
        id: 'line-2',
        discountType: 'AMOUNT' as const,
        discountValue: 50,
      },
    ];
    expect(projectMaterialTotal(lines)).toBe(1150);
    expect(projectLineDiscountTotal(lines)).toBe(50);
  });

  it('computeDiscountAmount respects percentage cap', () => {
    expect(computeDiscountAmount(1000, { discountType: 'PERCENTAGE', discountValue: 150 })).toBe(
      1000
    );
  });
});
