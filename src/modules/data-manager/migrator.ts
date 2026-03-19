import { createDefaultEntry, MeowDBEntrySchema, type MeowDBEntry } from '@/type/meowdb';

export function migrateEntry(input: unknown): MeowDBEntry {
  if (!input || typeof input !== 'object') {
    return createDefaultEntry();
  }

  const record = input as Record<string, unknown>;
  const legacyNsfw = record.NSFW;
  const legacyArchived = record.archives;

  const migrated = {
    ...record,
    nsfw: record.nsfw ?? legacyNsfw,
    archived: record.archived ?? legacyArchived,
  };

  return MeowDBEntrySchema.parse(migrated);
}
