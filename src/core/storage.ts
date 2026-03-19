import type { MeowDBEntry } from '@/type/meowdb';
import { getStContext, saveChat } from '@/core/api-bridge';

export function loadLatestEntry(): MeowDBEntry | null {
  const ctx = getStContext();
  const chat = (ctx?.chat ?? []) as any[];
  for (let i = chat.length - 1; i >= 0; i--) {
    const entry = chat[i]?.data?.meowDB as MeowDBEntry | undefined;
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
