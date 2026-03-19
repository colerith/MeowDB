import { MeowDBEntrySchema, type MeowDBEntry } from '@/type/meowdb';

export function validateEntry(entry: unknown): entry is MeowDBEntry {
  return MeowDBEntrySchema.safeParse(entry).success;
}

export function parseEntryObject(entry: unknown): MeowDBEntry | null {
  const parsed = MeowDBEntrySchema.safeParse(entry);
  return parsed.success ? parsed.data : null;
}
