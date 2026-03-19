import { migrateEntry } from '@/modules/data-manager/migrator';
import type { MeowDBEntry } from '@/type/meowdb';

export function serializeEntry(entry: MeowDBEntry): string {
  return JSON.stringify(entry);
}

export function parseEntry(text: string): MeowDBEntry | null {
  if (!text?.trim()) return null;

  try {
    const parsed = JSON.parse(text);
    return migrateEntry(parsed);
  } catch {
    return null;
  }
}
