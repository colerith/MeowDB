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

function cleanEventText(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/\s[?\uFF1F]\s/g, ' \u00b7 ')
    .replace(/\uFFFD+/g, '')
    .trim();
}

function normalizeEventTag(
  tag: string | undefined,
): '\u65e5\u5e38' | '\u8f6c\u6298' | '\u5173\u952e' | '\u5927\u4e8b\u4ef6' {
  if (tag === '\u65e5\u5e38' || tag === '\u8f6c\u6298' || tag === '\u5173\u952e' || tag === '\u5927\u4e8b\u4ef6') {
    return tag;
  }
  return '\u65e5\u5e38';
}

function syncEntryFromEvents(entry: MeowDBEntry): MeowDBEntry {
  const normalized = migrateEntry(entry);
  const cleanedEvents = (normalized.events ?? []).map(item => ({
    ...item,
    time: cleanEventText(item.time),
    location: cleanEventText(item.location),
    summary: cleanEventText(item.summary).replace(/[\r\n]+/g, ' '),
    tag: normalizeEventTag(item.tag),
  }));

  const list = [...cleanedEvents];
  if (!list.length) {
    return { ...normalized, events: cleanedEvents };
  }

  const latest = list.sort((a, b) => {
    const byIndex = (b.messageIndex ?? 0) - (a.messageIndex ?? 0);
    if (byIndex !== 0) return byIndex;
    return Number(b.pinned) - Number(a.pinned);
  })[0];

  if (!latest) return normalized;

  const next = structuredClone(normalized) as MeowDBEntry;
  next.events = cleanedEvents;

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
