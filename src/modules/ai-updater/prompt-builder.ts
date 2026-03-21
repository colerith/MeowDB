import type { MeowDBEntry } from '@/type/meowdb';

export interface PromptPayload {
  system: string;
  user: string;
}

export const DEFAULT_RELATIONS_PROMPT = [
  'relations_json 结构要求（数组，每个角色一条）：',
  '- name: 角色名（必须包含 <user> 对应角色）',
  '- gender: 性别',
  '- birthday: 生日（可用 MM-DD）',
  '- sexExp: 性经验（对象(次数)）',
  '- coordinate: 当前位置',
  '- action: 当前动作',
  '- clothing: 全套服饰总览（简写）',
  '- clothingParts: 服饰拆解对象，键必须齐全：headwear,jewelry,facewear,upper,lower,underwearTop,underwearBottom,shoesSocks',
  '- appearance: 外貌总览（简写）',
  '- appearanceParts: 外貌拆解对象，键必须齐全：hairColor,eyeColor,height,bodyType',
  '- genitalStatus: 性器官及状态',
  '- identity: 身份',
  '- personality: 核心人格',
  '- bond: 与对方当前羁绊描述',
  '- favorBase: 好感基础值（number，1位小数）',
  '- favorDelta: 本轮增减值（number，1位小数，可正可负）',
  '- favor: 最终值，等于 favorBase + favorDelta（number，1位小数）',
  '- favorChange: 增减原因（本轮关键事件）',
  '- manualEdited: object，保留已有 true 字段；没有手动改动可为空对象',
  '- aiBaseline: object，保留已有基线值；不要覆盖已存在基线',
  '',
  '[好感指南]',
  '1) 锚定前值，严禁无故跳涨；单次通常 +0.1~0.8',
  '2) 触犯禁忌/OOC/冲突时可强制扣分（-2~-10）',
  '3) 禁止把数值变化写成直白告白，用行为细节体现关系变化',
  '4) 对手动字段（manualEdited=true）默认保持原值，除非剧情出现明确冲突证据',
].join('\n');

export const DEFAULT_ECHOES_PROMPT = [
  'echoes_json 结构要求（数组，上限 10 条）：',
  '- character: 角色名',
  '- content: 待回收的关键承诺',
  '- status: 承诺状态，只能是“未完成”或“完成”',
  '',
  'echoes:',
  ' (上限10条，优先兑现旧承诺，完成即清理)',
  '- [角色名]：[待回收的关键承诺]（status=未完成|完成）',
  '',
  '处理规则（仅允许这三类操作）：',
  '- 处理/实现：旧承诺仍在推进时可更新描述，但 status 仍为“未完成”',
  '- 完成：承诺已兑现时先标记为“完成”',
  '- 清理：已完成或已失效承诺从 echoes_json 中移除',
  '- 禁止空泛情绪条目，必须是可追踪、可验证的承诺动作',
].join('\n');

interface BuildPromptOptions {
  relationsPrompt?: string;
  echoesPrompt?: string;
}

export function buildPrompt(
  currentEntry: MeowDBEntry,
  chatHistory: string,
  options: BuildPromptOptions = {},
): PromptPayload {
  const relationsPrompt = options.relationsPrompt?.trim() || DEFAULT_RELATIONS_PROMPT;
  const echoesPrompt = options.echoesPrompt?.trim() || DEFAULT_ECHOES_PROMPT;
  const manualHints = buildManualHints(currentEntry);

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
    echoesPrompt,
    '',
    '不要输出任何额外解释文本。',
  ].join('\n');

  const user = [
    '【当前数据】',
    JSON.stringify(currentEntry),
    '',
    '【手动编辑保护】',
    manualHints,
    '',
    '【最近对话】',
    chatHistory || '(空)',
    '',
    '【要求】',
    '- serial 在当前基础上递增',
    '- time 反映当前轮次时间描述',
    '- 根据剧情更新 scene / plot / relations / echoes / enigmas / seeds',
    '- 优先保证 relations_json 字段完整、可直接用于前端卡片展示',
    '- echoes_json 仅保留未完成承诺，完成或失效后清理，最多 10 条',
    '- echoes_json 的 status 字段只能是“未完成”或“完成”',
    '- 对 manualEdited=true 的字段，默认保持值不变',
  ].join('\n');

  return { system, user };
}

function buildManualHints(entry: MeowDBEntry): string {
  const lines: string[] = [];

  for (const relation of entry.relations ?? []) {
    const editedKeys = Object.keys(relation.manualEdited ?? {}).filter(key => relation.manualEdited?.[key]);
    if (!editedKeys.length) continue;

    const keyText = editedKeys.join(', ');
    lines.push(`- ${relation.name}: 锁定字段 -> ${keyText}`);
  }

  return lines.length ? lines.join('\n') : '无手动锁定字段。';
}
