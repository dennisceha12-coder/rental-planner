import { describe, expect, it } from 'vitest';
import {
  computeDiscountAmount,
  formatStaffelRule,
  lineBreakdown,
  lineNetTotal,
  lineTotal,
  projectLineDiscountTotal,
  projectMaterialTotal,
  projectExternalRentalMaterialTotal,
  projectOwnMaterialTotal,
  rentalDays,
  staffelFactor,
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
  discountType: null,
  discountValue: null,
  category: null,
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

  it('applies the default staffel instead of a full day price per day', () => {
    expect(staffelFactor(1)).toBe(1);
    expect(staffelFactor(2)).toBe(1.5);
    expect(staffelFactor(3)).toBe(1.75);
    expect(staffelFactor(7)).toBe(2.75);
    expect(staffelFactor(4, [100, 40])).toBe(2.2);
    expect(lineTotal(2, 100, start, end)).toBe(350);
    expect(formatStaffelRule()).toBe(
      'dag 1 100%, dag 2 50%, elke volgende dag 25% van de dagprijs'
    );
  });

  it('keeps a full day price when every staffel step is 100%', () => {
    expect(lineTotal(2, 100, start, end, [100])).toBe(600);
  });

  it('applies percentage line discount', () => {
    const line = {
      ...baseLine,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
    };
    expect(lineNetTotal(line)).toBe(315);
    expect(lineBreakdown(line).discount).toBe(35);
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
    expect(projectMaterialTotal(lines)).toBe(650);
    expect(projectLineDiscountTotal(lines)).toBe(50);
  });

  it('computeDiscountAmount respects percentage cap', () => {
    expect(computeDiscountAmount(1000, { discountType: 'PERCENTAGE', discountValue: 150 })).toBe(
      1000
    );
  });

  it('sums external rental material separately from own stock', () => {
    const external = {
      ...baseLine,
      id: 'line-ext',
      equipment: { ...baseLine.equipment!, dailyRate: 200, isExternalRental: true },
    };
    const lines = [baseLine, external];
    expect(projectExternalRentalMaterialTotal(lines)).toBe(700);
    expect(projectOwnMaterialTotal(lines)).toBe(350);
    expect(projectMaterialTotal(lines)).toBe(1050);
  });
});
