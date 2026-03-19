import type { MeowDBEntry } from '@/type/meowdb';
import { loadLatestEntry, saveEntry } from '@/core/storage';
import { validateEntry } from '@/modules/data-manager/validator';

export function getCurrentEntry(): MeowDBEntry | null {
  return loadLatestEntry();
}

export async function saveCurrentEntry(entry: MeowDBEntry): Promise<boolean> {
  if (!validateEntry(entry)) return false;
  await saveEntry(entry);
  return true;
}
