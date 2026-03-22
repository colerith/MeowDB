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

export const DEFAULT_EVENTS_PROMPT = [
  '事件时间轴（events_json，建议保留最近20条，最新在前）：',
  '- id: 事件ID（可留空）',
  '- messageIndex: 事件来源消息序号（整数，表示“根据 message 几生成”）',
  '- time: 事件时间文本（应与状态卡“当前时间”一致）',
  '- location: 事件地点文本（应与状态卡“当前地点”一致）',
  '- summary: 事件摘要（应与状态卡“剧情摘要”一致）',
  '- tag: 事件标记，仅允许 日常/转折/关键/大事件',
  '- pinned: 是否置顶（boolean）',
  '',
  '规则：',
  '- 最新事件必须放在最上方，messageIndex 必须递增可追溯',
  '- 常规事件默认 tag=日常，重大推进可标记 转折/关键/大事件',
  '- 置顶事件最多3条，优先保留仍在持续影响剧情的事件',
  '- 若存在置顶事件，后续关系/承诺/待办更新必须优先参考这些置顶事件',
].join('\n');

export const DEFAULT_ECHOES_PROMPT = [
  'A. 承诺池（echoes_json，长期承诺，上限10条）',
  '- character: 角色名',
  '- promise: 承诺本体（长期、可被召回）',
  '- status: 仅“未完成”或“完成”',
  '- content: 兼容旧字段，可选',
  '',
  'B. 待办池（todos_json，短期任务，上限10条）',
  '- title: 待办标题（短句）',
  '- eta: 预计执行时间（如 今晚 / 本周末 / 2026-03-25）',
  '- participants: 参与人员数组',
  '- note: 备注',
  '- quadrant: 四象限等级，Q1/Q2/Q3/Q4',
  '- aiPriority: AI优先级，P0/P1/P2/P3（P0最高）',
  '- status: 待执行/进行中/已完成',
  '',
  '处理规则（仅允许 处理 / 实现 / 清理）：',
  '- 处理：持续细化承诺与待办，保持字段完整',
  '- 实现：已兑现承诺或已完成待办，更新 status',
  '- 清理：已完成且不再需要追踪的条目移除',
  '- 优先兑现旧承诺；待办优先推进 Q1 与高优先级(P0/P1)',
].join('\n');

interface BuildPromptOptions {
  relationsPrompt?: string;
  eventsPrompt?: string;
  echoesPrompt?: string;
}

export function buildPrompt(
  currentEntry: MeowDBEntry,
  chatHistory: string,
  options: BuildPromptOptions = {},
): PromptPayload {
  const relationsPrompt = options.relationsPrompt?.trim() || DEFAULT_RELATIONS_PROMPT;
  const eventsPrompt = options.eventsPrompt?.trim() || DEFAULT_EVENTS_PROMPT;
  const echoesPrompt = options.echoesPrompt?.trim() || DEFAULT_ECHOES_PROMPT;
  const manualHints = buildManualHints(currentEntry);

  const system = [
    '你是 MeowDB 剧情数据库维护器。',
    '根据对话历史更新剧情结构化数据。',
    '输出必须严格为 <meow_FM><details>...</details></meow_FM>。',
    'details 内必须包含以下行键：',
    'serial,time,nsfw,scene_main,scene_sub,scene_stay_rounds,scene_topic,plot,relations_json,events_json,echoes_json,todos_json,archived_json,enigmas_json,seeds_json',
    'plot 必须使用 plot:\n<<<\n...\n>>> 结构。',
    '其中 *_json 字段必须是合法 JSON 数组字符串。',
    '',
    relationsPrompt,
    '',
    eventsPrompt,
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
    '- 根据剧情更新 scene / plot / relations / events / echoes / todos / enigmas / seeds',
    '- 优先保证 relations_json 字段完整、可直接用于前端卡片展示',
    '- events_json 维护时间轴（最新在前），并保证 time/location/summary 与状态卡映射一致',
    '- events_json 中 pinned=true 的条目最多3条，后续更新需优先参考',
    '- echoes_json 为长期承诺池（最多10条）',
    '- todos_json 为短期待办池（最多10条），必须包含 quadrant 与 aiPriority',
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
