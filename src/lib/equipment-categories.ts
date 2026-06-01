import type { ProjectLineRecord } from '@/lib/pricing';

export const FALLBACK_CATEGORY_NAME = 'Overig';
export const CUSTOM_LINE_CATEGORY_NAME = 'Tijdelijk';

function isCustomLine(line: ProjectLineRecord): boolean {
  return line.customName != null && line.customName.trim() !== '';
}

export type CategoryRef = {
  id: string;
  name: string;
  sortOrder: number;
};

export type CategoryGroup<T> = {
  key: string;
  name: string;
  sortOrder: number;
  items: T[];
};

export function categoryDisplayName(category: CategoryRef | null | undefined): string {
  return category?.name ?? FALLBACK_CATEGORY_NAME;
}

export function groupEquipmentByCategory<
  T extends { category: CategoryRef | null; name: string },
>(items: T[]): CategoryGroup<T>[] {
  const map = new Map<string, CategoryGroup<T>>();

  for (const item of items) {
    const key = item.category?.id ?? '__none__';
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: categoryDisplayName(item.category),
        sortOrder: item.category?.sortOrder ?? 999,
        items: [],
      });
    }
    map.get(key)!.items.push(item);
  }

  return [...map.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name, 'nl')),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'nl'));
}

export function groupProjectLinesByCategory(
  lines: ProjectLineRecord[]
): CategoryGroup<ProjectLineRecord>[] {
  const map = new Map<string, CategoryGroup<ProjectLineRecord>>();

  for (const line of lines) {
    let key: string;
    let name: string;
    let sortOrder: number;

    if (isCustomLine(line)) {
      key = '__custom__';
      name = CUSTOM_LINE_CATEGORY_NAME;
      sortOrder = 998;
    } else {
      const cat = line.equipment?.category;
      key = cat?.id ?? '__none__';
      name = categoryDisplayName(cat);
      sortOrder = cat?.sortOrder ?? 999;
    }

    if (!map.has(key)) {
      map.set(key, { key, name, sortOrder, items: [] });
    }
    map.get(key)!.items.push(line);
  }

  return [...map.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'nl')
  );
}
