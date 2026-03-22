import type { MeowDBEntry } from '@/type/meowdb';
import { getStContext, saveChat } from '@/core/api-bridge';

const ENTRY_CACHE_PREFIX = 'meowdb:entry:v1:';

function resolveChatKey(ctx: unknown): string {
  const record = (ctx ?? {}) as Record<string, unknown>;
  const candidates = [
    record.chatId,
    record.chat_id,
    record.conversationId,
    record.conversation_id,
    record.chatFile,
    record.chat_file,
    record.groupId,
    record.group_id,
    record.characterId,
    record.character_id,
    record.name2,
  ];

  const hit = candidates.find(item => typeof item === 'string' || typeof item === 'number');
  return String(hit ?? 'default');
}

function getCacheKey(ctx: unknown): string {
  return `${ENTRY_CACHE_PREFIX}${resolveChatKey(ctx)}`;
}

function writeEntryCache(ctx: unknown, entry: unknown) {
  try {
    localStorage.setItem(getCacheKey(ctx), JSON.stringify(entry));
  } catch {
    // ignore cache failure
  }
}

function readEntryCache(ctx: unknown): unknown | null {
  try {
    const raw = localStorage.getItem(getCacheKey(ctx));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function removeEntryCache(ctx: unknown) {
  try {
    localStorage.removeItem(getCacheKey(ctx));
  } catch {
    // ignore cache failure
  }
}

export function loadLatestEntry(): unknown | null {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  for (let i = chat.length - 1; i >= 0; i--) {
    const entry = chat[i]?.data?.meowDB;
    if (entry) {
      writeEntryCache(ctx, entry);
      return entry;
    }
  }

  return readEntryCache(ctx);
}

export async function saveEntry(entry: MeowDBEntry): Promise<void> {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  const lastMsg = chat[chat.length - 1];

  if (lastMsg) {
    if (!lastMsg.data) lastMsg.data = {};
    lastMsg.data.meowDB = entry;
    await saveChat();
  }

  // always keep a local cache fallback for refresh scenarios
  writeEntryCache(ctx, entry);
}

export async function clearEntries(): Promise<number> {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  let cleared = 0;

  for (const msg of chat) {
    if (!msg?.data) continue;
    if (msg.data.meowDB) {
      delete msg.data.meowDB;
      cleared += 1;
    }
    if (msg.data.meowDB_history) {
      delete msg.data.meowDB_history;
    }
  }

  removeEntryCache(ctx);

  if (cleared > 0) {
    await saveChat();
  }

  return cleared;
}
