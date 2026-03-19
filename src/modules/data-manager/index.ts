import { clearEntries, loadLatestEntry, saveEntry } from '@/core/storage';
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
  notifyDataUpdated();
  return true;
}

export async function clearAllEntries(): Promise<number> {
  const cleared = await clearEntries();
  notifyDataUpdated();
  return cleared;
}

function notifyDataUpdated() {
  window.dispatchEvent(new CustomEvent('meowdb:data-updated'));
}

export * from './migrator';
export * from './validator';
export * from './serializer';
