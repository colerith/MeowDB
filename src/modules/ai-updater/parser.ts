import { parseEntry as parseSerializedEntry } from '@/modules/data-manager/serializer';
import type { MeowDBEntry } from '@/type/meowdb';

export interface ParsedAiResponse {
  rawBlock: string;
  entry: MeowDBEntry;
}

export function parseResponse(raw: string): ParsedAiResponse | null {
  const text = raw?.trim();
  if (!text) return null;

  const block = extractFmBlock(text) ?? text;
  const entry = parseSerializedEntry(block);
  if (!entry) return null;

  return { rawBlock: block, entry };
}

function extractFmBlock(text: string): string | null {
  const match = text.match(/<meow_FM>[\s\S]*?<\/meow_FM>/i);
  return match?.[0] ?? null;
}
