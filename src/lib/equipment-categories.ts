import type { ProjectLineRecord } from '@/lib/pricing';

export const FALLBACK_CATEGORY_NAME = 'Overig';

function isCustomLine(line: ProjectLineRecord): boolean {
  return line.customName != null && line.customName.trim() !== '';
}

function lineSortName(line: ProjectLineRecord): string {
  if (isCustomLine(line)) return line.customName!.trim();
  return line.equipment?.name ?? '';
}

function resolveLineCategory(line: ProjectLineRecord): CategoryRef | null {
  if (isCustomLine(line)) return line.category ?? null;
  return line.equipment?.category ?? null;
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

export function groupProjectLinesByCategory<T extends ProjectLineRecord>(
  lines: T[]
): CategoryGroup<T>[] {
  const map = new Map<string, CategoryGroup<T>>();

  for (const line of lines) {
    const cat = resolveLineCategory(line);
    const key = cat?.id ?? '__none__';
    const name = categoryDisplayName(cat);
    const sortOrder = cat?.sortOrder ?? 999;

    if (!map.has(key)) {
      map.set(key, { key, name, sortOrder, items: [] });
    }
    map.get(key)!.items.push(line);
  }

  return [...map.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) =>
        lineSortName(a).localeCompare(lineSortName(b), 'nl')
      ),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'nl'));
}
