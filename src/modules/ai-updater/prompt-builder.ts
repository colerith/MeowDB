import type { MeowDBEntry } from '@/type/meowdb';

export interface PromptPayload {
  system: string;
  user: string;
}

export function buildPrompt(currentEntry: MeowDBEntry, chatHistory: string): PromptPayload {
  const system = [
    '你是 MeowDB 剧情数据库维护器。',
    '根据对话历史更新剧情结构化数据。',
    '输出必须严格为 <meow_FM><details>...</details></meow_FM>。',
    'details 内必须包含以下行键：',
    'serial,time,nsfw,scene_main,scene_sub,scene_stay_rounds,scene_topic,plot,relations_json,echoes_json,archived_json,enigmas_json,seeds_json',
    'plot 必须使用 plot:\n<<<\n...\n>>> 结构。',
    '其中 *_json 字段必须是合法 JSON 数组字符串。',
    '不要输出任何额外解释文本。',
  ].join('\n');

  const user = [
    '【当前数据】',
    JSON.stringify(currentEntry),
    '',
    '【最近对话】',
    chatHistory || '(空)',
    '',
    '【要求】',
    '- serial 在当前基础上递增',
    '- time 反映当前轮次时间描述',
    '- 根据剧情更新 scene / plot / relations / echoes / enigmas / seeds',
  ].join('\n');

  return { system, user };
}
