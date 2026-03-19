import { migrateEntry } from '@/modules/data-manager/migrator';
import type { MeowDBEntry } from '@/type/meowdb';

const OPEN_TAG = '<meow_FM>';
const CLOSE_TAG = '</meow_FM>';
const DETAILS_OPEN = '<details>';
const DETAILS_CLOSE = '</details>';

export function serializeEntry(entry: MeowDBEntry): string {
  const normalized = migrateEntry(entry);

  const lines = [
    OPEN_TAG,
    DETAILS_OPEN,
    `serial:${normalized.serial}`,
    `time:${normalized.time}`,
    `nsfw:${normalized.nsfw.current}/${normalized.nsfw.max}`,
    `scene_main:${normalized.scene.main}`,
    `scene_sub:${normalized.scene.sub}`,
    `scene_stay_rounds:${normalized.scene.stayRounds}`,
    `scene_topic:${normalized.scene.topic}`,
    'plot:',
    '<<<',
    normalized.plot ?? '',
    '>>>',
    `relations_json:${JSON.stringify(normalized.relations)}`,
    `echoes_json:${JSON.stringify(normalized.echoes)}`,
    `archived_json:${JSON.stringify(normalized.archived)}`,
    `enigmas_json:${JSON.stringify(normalized.enigmas)}`,
    `seeds_json:${JSON.stringify(normalized.seeds)}`,
    DETAILS_CLOSE,
    CLOSE_TAG,
  ];

  return lines.join('\n');
}

export function parseEntry(text: string): MeowDBEntry | null {
  const raw = text?.trim();
  if (!raw) return null;

  // Backward compatibility for pure JSON storage.
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      return migrateEntry(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  return parseFmEntry(raw);
}

function parseFmEntry(raw: string): MeowDBEntry | null {
  const details = extractDetailsBlock(raw);
  if (!details) return null;

  const serial = readLineField(details, 'serial') ?? '🐾喵喵摘要-001';
  const time = readLineField(details, 'time') ?? '';
  const nsfwText = readLineField(details, 'nsfw') ?? '0/20';
  const [nsfwCurrent, nsfwMax] = parseNsfw(nsfwText);

  const sceneMain = readLineField(details, 'scene_main') ?? '';
  const sceneSub = readLineField(details, 'scene_sub') ?? '';
  const sceneStayRounds = parseIntSafe(readLineField(details, 'scene_stay_rounds'), 0);
  const sceneTopic = readLineField(details, 'scene_topic') ?? '';

  const plot = readPlotBlock(details) ?? '';

  const relations = parseJsonArray(readLineField(details, 'relations_json'));
  const echoes = parseJsonArray(readLineField(details, 'echoes_json'));
  const archived = parseJsonArray(readLineField(details, 'archived_json'));
  const enigmas = parseJsonArray(readLineField(details, 'enigmas_json'));
  const seeds = parseJsonArray(readLineField(details, 'seeds_json'));

  try {
    return migrateEntry({
      serial,
      time,
      nsfw: {
        current: nsfwCurrent,
        max: nsfwMax,
      },
      scene: {
        main: sceneMain,
        sub: sceneSub,
        stayRounds: sceneStayRounds,
        topic: sceneTopic,
      },
      plot,
      relations,
      echoes,
      archived,
      enigmas,
      seeds,
    });
  } catch {
    return null;
  }
}

function extractDetailsBlock(raw: string): string | null {
  const hasTags = raw.includes(OPEN_TAG) && raw.includes(CLOSE_TAG);
  if (!hasTags) return null;

  const match = raw.match(/<details>\s*([\s\S]*?)\s*<\/details>/i);
  return match?.[1]?.trim() ?? null;
}

function readLineField(content: string, key: string): string | null {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escapedKey}:(.*)$`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function readPlotBlock(content: string): string | null {
  const match = content.match(/plot:\s*\n<<<\n([\s\S]*?)\n>>>/m);
  return match ? match[1] : null;
}

function parseJsonArray(value: string | null): unknown[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseNsfw(value: string): [number, number] {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return [0, 20];

  const current = parseIntSafe(match[1], 0);
  const max = parseIntSafe(match[2], 20);
  return [current, Math.max(max, 1)];
}

function parseIntSafe(value: string | null | undefined, fallback: number): number {
  if (typeof value !== 'string') return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}
