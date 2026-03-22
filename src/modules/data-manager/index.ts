import { clearEntries, loadLatestEntry, saveEntry } from '@/core/storage';
import { migrateEntry } from '@/modules/data-manager/migrator';
import { parseEntryObject, validateEntry } from '@/modules/data-manager/validator';
import type { MeowDBEntry } from '@/type/meowdb';

export function getCurrentEntry(): MeowDBEntry | null {
  const raw = loadLatestEntry();
  if (!raw) return null;

  try {
    return syncEntryFromEvents(migrateEntry(raw));
  } catch {
    const parsed = parseEntryObject(raw);
    return parsed ? syncEntryFromEvents(parsed) : null;
  }
}

export async function saveCurrentEntry(entry: MeowDBEntry): Promise<boolean> {
  const synced = syncEntryFromEvents(entry);
  if (!validateEntry(synced)) return false;
  await saveEntry(synced);
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

function syncEntryFromEvents(entry: MeowDBEntry): MeowDBEntry {
  const normalized = migrateEntry(entry);
  const list = [...(normalized.events ?? [])];
  if (!list.length) return normalized;

  const latest = list.sort((a, b) => {
    const byIndex = (b.messageIndex ?? 0) - (a.messageIndex ?? 0);
    if (byIndex !== 0) return byIndex;
    return Number(b.pinned) - Number(a.pinned);
  })[0];

  if (!latest) return normalized;

  const next = structuredClone(normalized) as MeowDBEntry;

  if (latest.time?.trim()) {
    next.time = latest.time.trim();
  }

  if (latest.summary?.trim()) {
    next.plot = latest.summary.trim();
  }

  if (latest.location?.trim()) {
    const location = latest.location.trim();
    const split = location.split(' - ');
    if (split.length >= 2) {
      next.scene.main = split[0] || next.scene.main;
      next.scene.sub = split.slice(1).join(' - ') || next.scene.sub;
    } else {
      next.scene.main = location;
    }
  }

  return next;
}
