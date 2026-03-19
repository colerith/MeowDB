import type { MeowDBEntry } from '@/type/meowdb';

export function validateEntry(entry: MeowDBEntry): boolean {
  if (!entry) return false;
  if (!entry.serial || !entry.time) return false;
  if (!entry.scene || !entry.plot) return false;
  return true;
}
