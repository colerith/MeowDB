import type { MeowDBEntry } from '@/type/meowdb';
import { loadLatestEntry } from '@/core/storage';

export function getCurrentEntry(): MeowDBEntry | null {
  return loadLatestEntry();
}
