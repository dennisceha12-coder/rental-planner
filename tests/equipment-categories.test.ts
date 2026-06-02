import { describe, expect, it } from 'vitest';
import { groupProjectLinesByCategory } from '@/lib/equipment-categories';
import type { ProjectLineRecord } from '@/lib/pricing';

const catGeluid = { id: 'cat_geluid', name: 'Geluid', sortOrder: 0 };
const catLicht = { id: 'cat_licht', name: 'Licht', sortOrder: 1 };

function catalogLine(name: string, category: typeof catGeluid): ProjectLineRecord {
  return {
    id: `line-${name}`,
    quantity: 1,
    rentalStart: new Date('2026-06-01'),
    rentalEnd: new Date('2026-06-01'),
    equipmentId: `eq-${name}`,
    customName: null,
    customDailyRate: null,
    discountType: null,
    discountValue: null,
    category: null,
    equipment: {
      id: `eq-${name}`,
      name,
      dailyRate: 50,
      stockQty: null,
      isExternalRental: false,
      category,
    },
  };
}

function customLine(name: string, category: typeof catLicht): ProjectLineRecord {
  return {
    id: `custom-${name}`,
    quantity: 1,
    rentalStart: new Date('2026-06-01'),
    rentalEnd: new Date('2026-06-01'),
    equipmentId: null,
    customName: name,
    customDailyRate: 0,
    discountType: null,
    discountValue: null,
    category,
    equipment: null,
  };
}

describe('groupProjectLinesByCategory', () => {
  it('groups catalog and temporary lines in the same categories', () => {
    const groups = groupProjectLinesByCategory([
      catalogLine('Speaker', catGeluid),
      customLine('Extra kabel', catGeluid),
      catalogLine('PAR', catLicht),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('Geluid');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].name).toBe('Licht');
    expect(groups[1].items).toHaveLength(1);
  });
});
