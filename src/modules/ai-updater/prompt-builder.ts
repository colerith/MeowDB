import type { MeowDBEntry } from '@/type/meowdb';

export interface PromptPayload {
  system: string;
  user: string;
}

export const DEFAULT_RELATIONS_PROMPT = [
  'relations_json 结构要求（数组，每个角色一条）：',
  '- name: 角色名（必须包含 <user> 对应角色）',
  '- gender: 性别',
  '- sexExp: 性经验（对象(次数)）',
  '- coordinate: 当前位置',
  '- action: 当前动作',
  '- clothing: 全套服饰（含内衣饰品）',
  '- genitalStatus: 性器官及状态',
  '- identity: 身份',
  '- personality: 核心人格',
  '- bond: 与对方当前羁绊描述',
  '- favor: 好感值（number，保留1位小数）',
  '- favorChange: 增幅原因（本轮关键事件）',
  '',
  'relation 卡片语义参考：',
  '◈ [名称] <[性别] ⌾ [性器官及状态]>',
  '├─ [身份] , [核心人格] , [性经验: 对象(次数)]',
  '├─ [坐标] , [全套衣着(含内衣饰品)] , [实时动作]',
  '└─ [羁绊 ⌾ 好感值(±0.0)，增幅原因: ...]',
  '',
  '[好感指南]',
  '1) 锚定前值，严禁无故跳涨；单次通常 +0.1~0.8',
  '2) 触犯禁忌/OOC/冲突时可强制扣分（-2~-10）',
  '3) 禁止把数值变化写成直白告白，用行为细节体现关系变化',
].join('\n');

interface BuildPromptOptions {
  relationsPrompt?: string;
}

export function buildPrompt(
  currentEntry: MeowDBEntry,
  chatHistory: string,
  options: BuildPromptOptions = {},
): PromptPayload {
  const relationsPrompt = options.relationsPrompt?.trim() || DEFAULT_RELATIONS_PROMPT;

  const system = [
    '你是 MeowDB 剧情数据库维护器。',
    '根据对话历史更新剧情结构化数据。',
    '输出必须严格为 <meow_FM><details>...</details></meow_FM>。',
    'details 内必须包含以下行键：',
    'serial,time,nsfw,scene_main,scene_sub,scene_stay_rounds,scene_topic,plot,relations_json,echoes_json,archived_json,enigmas_json,seeds_json',
    'plot 必须使用 plot:\n<<<\n...\n>>> 结构。',
    '其中 *_json 字段必须是合法 JSON 数组字符串。',
    '',
    relationsPrompt,
    '',
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
    '- 优先保证 relations_json 字段完整、可直接用于前端卡片展示',
  ].join('\n');

  return { system, user };
}
