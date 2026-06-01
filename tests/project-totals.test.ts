import { describe, expect, it } from 'vitest';
import { computeProjectTotals, computeTotalDiscountAmount, transportTotal } from '@/lib/project-totals';

const start = new Date('2026-06-01');
const end = new Date('2026-06-03');

describe('project-totals', () => {
  it('computes transport per km', () => {
    expect(
      transportTotal({
        transportType: 'PER_KM',
        transportKm: 100,
        transportRatePerKm: 0.5,
        transportFixedAmount: null,
      })
    ).toBe(50);
  });

  it('computes fixed transport', () => {
    expect(
      transportTotal({
        transportType: 'FIXED',
        transportKm: null,
        transportRatePerKm: null,
        transportFixedAmount: 350,
      })
    ).toBe(350);
  });

  it('applies total discount after line discounts', () => {
    const lines = [
      {
        id: 'l1',
        quantity: 1,
        rentalStart: start,
        rentalEnd: end,
        equipmentId: 'eq',
        customName: null,
        customDailyRate: null,
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        equipment: {
          id: 'eq',
          name: 'Item',
          dailyRate: 100,
          stockQty: null,
          isExternalRental: false,
          category: null,
        },
      },
    ];
    const totals = computeProjectTotals(lines, {
      hourlyRate: null,
      totalDiscountAmount: 50,
      crewShifts: [],
      transportType: 'FIXED',
      transportKm: null,
      transportRatePerKm: null,
      transportFixedAmount: 100,
    });
    expect(totals.material).toBe(270);
    expect(totals.transport).toBe(100);
    expect(totals.subtotalBeforeTotalDiscount).toBe(370);
    expect(totals.totalDiscountAmount).toBe(50);
    expect(totals.grandTotal).toBe(320);
  });

  it('caps total discount at subtotal', () => {
    expect(computeTotalDiscountAmount(100, 250)).toBe(100);
  });
});
