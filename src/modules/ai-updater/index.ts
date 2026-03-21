import { extension_settings } from '@sillytavern/scripts/extensions';
import { getStContext } from '@/core/api-bridge';
import { getCurrentEntry, saveCurrentEntry } from '@/modules/data-manager';
import { callApi } from '@/modules/ai-updater/api-caller';
import { parseResponse } from '@/modules/ai-updater/parser';
import { buildPrompt } from '@/modules/ai-updater/prompt-builder';
import { createDefaultEntry } from '@/type/meowdb';
import type { Settings } from '@/type/settings';
import { setting_field } from '@/type/settings';

export interface ManualUpdateResult {
  ok: boolean;
  error?: string;
}

export async function runManualAiUpdate(): Promise<ManualUpdateResult> {
  const settings = readSettings();
  const currentEntry = getCurrentEntry() ?? createDefaultEntry();
  const chatHistory = buildChatHistory();
  const prompt = buildPrompt(currentEntry, chatHistory, {
    relationsPrompt: settings.relations_prompt,
    echoesPrompt: settings.echoes_prompt,
  });

  try {
    const raw = await callApi(prompt, settings);
    const parsed = parseResponse(raw);
    if (!parsed) {
      return { ok: false, error: 'AI 返回无法解析为 meow_FM。' };
    }

    const saved = await saveCurrentEntry(parsed.entry);
    if (!saved) {
      return { ok: false, error: '解析成功，但保存前校验失败。' };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function readSettings(): Settings {
  return (_.get(extension_settings, setting_field) as Settings | undefined) ?? ({} as Settings);
}

function buildChatHistory(limit = 12): string {
  const ctx = getStContext();
  const chat = ((ctx?.chat ?? []) as any[]).slice(-limit);

  return chat
    .map((msg, index) => {
      const role = msg?.is_user ? 'USER' : msg?.is_system ? 'SYSTEM' : 'CHAR';
      const text = String(msg?.mes ?? '').trim();
      if (!text) return null;
      return `#${index + 1} [${role}] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

export * from './prompt-builder';
export * from './api-caller';
export * from './parser';
