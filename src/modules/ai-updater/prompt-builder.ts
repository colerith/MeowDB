import type { MeowDBEntry } from '@/type/meowdb';

export interface PromptPayload {
  system: string;
  user: string;
}

export const DEFAULT_RELATIONS_PROMPT = [
  'relations_json �ṹҪ�����飬ÿ����ɫһ������',
  '- name: ��ɫ����������� <user> ��Ӧ��ɫ��',
  '- gender: �Ա�',
  '- birthday: ���գ����� MM-DD��',
  '- sexExp: �Ծ��飨����(����)��',
  '- coordinate: ��ǰλ��',
  '- action: ��ǰ����',
  '- clothing: ȫ�׷�����������д��',
  '- clothingParts: ���β����󣬼�������ȫ��headwear,jewelry,facewear,upper,lower,underwearTop,underwearBottom,shoesSocks',
  '- appearance: ��ò��������д��',
  '- appearanceParts: ��ò�����󣬼�������ȫ��hairColor,eyeColor,height,bodyType',
  '- genitalStatus: �����ټ�״̬',
  '- identity: ����',
  '- personality: �����˸�',
  '- bond: ��Է���ǰ�����',
  '- favorBase: �øл���ֵ��number��1λС����',
  '- favorDelta: ��������ֵ��number��1λС���������ɸ���',
  '- favor: ����ֵ������ favorBase + favorDelta��number��1λС����',
  '- favorChange: ����ԭ�򣨱��ֹؼ��¼���',
  '- manualEdited: object���������� true �ֶΣ�û���ֶ��Ķ���Ϊ�ն���',
  '- aiBaseline: object���������л���ֵ����Ҫ�����Ѵ��ڻ���',
  '',
  'relation ��Ƭ����ο���',
  '? [����] <[�Ա�] ? [�����ټ�״̬]>',
  '���� [����] , [�����˸�] , [����] , [�Ծ���: ����(����)]',
  '���� [����] , [���β��] , [��ò���] , [ʵʱ����]',
  '���� [� ? ����ֵ+����ֵ=����ֵ������ԭ��: ...]',
  '',
  '[�ø�ָ��]',
  '1) ê��ǰֵ���Ͻ��޹����ǣ�����ͨ�� +0.1~0.8',
  '2) ��������/OOC/��ͻʱ��ǿ�ƿ۷֣�-2~-10��',
  '3) ��ֹ����ֵ�仯д��ֱ�׸�ף�����Ϊϸ�����ֹ�ϵ�仯',
  '4) ���ֶ��ֶΣ�manualEdited=true��Ĭ�ϱ���ԭֵ�����Ǿ��������ȷ��ͻ֤��',
].join('\n');

export const DEFAULT_ECHOES_PROMPT = [
  'echoes_json �ṹҪ�����飬����10������',
  '- character: ��ɫ��',
  '- content: �����յĹؼ���ŵ',
  '',
  'echoes:',
  ' (����10�������ȶ��־ɳ�ŵ����ɼ�����)',
  '- [��ɫ��]��[�����յĹؼ���ŵ]',
  '',
  'ά������',
  '- ��δ���ֵľɳ�ŵ���ȱ������ɲ���ϸ��',
  '- �Ѷ���/��ʧЧ�ĳ�ŵӦ�� echoes_json ����',
  '- ������ŵ����¼�ؼ���׷�ٶ�������д�շ�����',
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
    '���� MeowDB �������ݿ�ά������',
    '���ݶԻ���ʷ���¾���ṹ�����ݡ�',
    '��������ϸ�Ϊ <meow_FM><details>...</details></meow_FM>��',
    'details �ڱ�����������м���',
    'serial,time,nsfw,scene_main,scene_sub,scene_stay_rounds,scene_topic,plot,relations_json,echoes_json,archived_json,enigmas_json,seeds_json',
    'plot ����ʹ�� plot:\n<<<\n...\n>>> �ṹ��',
    '���� *_json �ֶα����ǺϷ� JSON �����ַ�����',
    '',
    relationsPrompt,
    '',
    echoesPrompt,
    '',
    '��Ҫ����κζ�������ı���',
  ].join('\n');

  const user = [
    '����ǰ���ݡ�',
    JSON.stringify(currentEntry),
    '',
    '���ֶ��༭������',
    manualHints,
    '',
    '������Ի���',
    chatHistory || '(��)',
    '',
    '��Ҫ��',
    '- serial �ڵ�ǰ�����ϵ���',
    '- time ��ӳ��ǰ�ִ�ʱ������',
    '- ���ݾ������ scene / plot / relations / echoes / enigmas / seeds',
    '- ���ȱ�֤ relations_json �ֶ���������ֱ������ǰ�˿�Ƭչʾ',
    '- echoes_json ����δ���ֳ�ŵ�������Ѷ��ֳ�ŵ����� 10 ��',
    '- �� manualEdited=true ���ֶΣ�Ĭ�ϱ���ֵ����',
  ].join('\n');

  return { system, user };
}

function buildManualHints(entry: MeowDBEntry): string {
  const lines: string[] = [];

  for (const relation of entry.relations ?? []) {
    const editedKeys = Object.keys(relation.manualEdited ?? {}).filter(key => relation.manualEdited?.[key]);
    if (!editedKeys.length) continue;

    const keyText = editedKeys.join(', ');
    lines.push(`- ${relation.name}: �����ֶ� -> ${keyText}`);
  }

  return lines.length ? lines.join('\n') : '���ֶ������ֶΡ�';
}
