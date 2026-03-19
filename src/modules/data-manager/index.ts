import { loadLatestEntry, saveEntry } from '@/core/storage';
import { migrateEntry } from '@/modules/data-manager/migrator';
import { parseEntryObject, validateEntry } from '@/modules/data-manager/validator';
import type { MeowDBEntry } from '@/type/meowdb';

export function getCurrentEntry(): MeowDBEntry | null {
  const raw = loadLatestEntry();
  if (!raw) return null;

  try {
    return migrateEntry(raw);
  } catch {
    return parseEntryObject(raw);
  }
}

export async function saveCurrentEntry(entry: MeowDBEntry): Promise<boolean> {
  if (!validateEntry(entry)) return false;
  await saveEntry(entry);
  return true;
}

export * from './migrator';
export * from './validator';
export * from './serializer';
