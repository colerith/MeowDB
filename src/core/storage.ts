import type { MeowDBEntry } from '@/type/meowdb';
import { getStContext, saveChat } from '@/core/api-bridge';

export function loadLatestEntry(): unknown | null {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  for (let i = chat.length - 1; i >= 0; i--) {
    const entry = chat[i]?.data?.meowDB;
    if (entry) return entry;
  }
  return null;
}

export async function saveEntry(entry: MeowDBEntry): Promise<void> {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  const lastMsg = chat[chat.length - 1];
  if (!lastMsg) return;
  if (!lastMsg.data) lastMsg.data = {};
  lastMsg.data.meowDB = entry;
  await saveChat();
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

  if (cleared > 0) {
    await saveChat();
  }

  return cleared;
}
