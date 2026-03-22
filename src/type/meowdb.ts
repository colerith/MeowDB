import { z } from 'zod';

export const NSFWDetailsSchema = z.record(z.string(), z.unknown()).default({});

export const ClothingPartsSchema = z.object({
  headwear: z.string().default(''),
  jewelry: z.string().default(''),
  facewear: z.string().default(''),
  upper: z.string().default(''),
  lower: z.string().default(''),
  underwearTop: z.string().default(''),
  underwearBottom: z.string().default(''),
  shoesSocks: z.string().default(''),
});

export const AppearancePartsSchema = z.object({
  hairColor: z.string().default(''),
  eyeColor: z.string().default(''),
  height: z.string().default(''),
  bodyType: z.string().default(''),
});

export const CharacterRelationSchema = z.object({
  name: z.string().trim().min(1),
  gender: z.string().default(''),
  birthday: z.string().default(''),
  genitalStatus: z.string().default(''),
  identity: z.string().default(''),
  personality: z.string().default(''),
  sexExp: z.string().default(''),
  coordinate: z.string().default(''),
  clothing: z.string().default(''),
  clothingParts: ClothingPartsSchema.default({}),
  appearance: z.string().default(''),
  appearanceParts: AppearancePartsSchema.default({}),
  action: z.string().default(''),
  bond: z.string().default(''),
  favor: z.number().default(0),
  favorBase: z.number().default(0),
  favorDelta: z.number().default(0),
  favorChange: z.string().default(''),
  manualEdited: z.record(z.string(), z.boolean()).default({}),
  aiBaseline: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
});

export const EchoSchema = z.object({
  character: z.string().trim().min(1),
  promise: z.string().default(''),
  content: z.string().trim().default(''),
  status: z.enum(['未完成', '完成']).default('未完成'),
});

export const TodoSchema = z.object({
  title: z.string().trim().min(1),
  eta: z.string().default(''),
  participants: z.array(z.string()).default([]),
  note: z.string().default(''),
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).default('Q2'),
  aiPriority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P2'),
  status: z.enum(['待执行', '进行中', '已完成']).default('待执行'),
});

export const StoryEventSchema = z.object({
  id: z.string().trim().default(''),
  messageIndex: z.number().int().min(1).default(1),
  time: z.string().default(''),
  location: z.string().default(''),
  summary: z.string().default(''),
  tag: z.enum(['日常', '转折', '关键', '大事件']).default('日常'),
  pinned: z.boolean().default(false),
});

export const ArchivedNPCSchema = z.object({
  name: z.string().trim().min(1),
  location: z.string().default(''),
  trigger: z.string().default(''),
});

export const EnigmaSchema = z.object({
  content: z.string().trim().min(1),
  progress: z.number().min(0).max(100).default(0),
  related: z.array(z.string()).default([]),
});

export const SeedSchema = z.object({
  type: z.enum(['soul', 'world']).default('world'),
  name: z.string().trim().min(1),
  bloom: z.number().int().min(0).max(5).default(0),
  suspense: z.string().default(''),
  driveLink: z.string().default(''),
});

export const MeowDBEntrySchema = z.object({
  serial: z.string().trim().min(1).default('🐾喵喵摘要-001'),
  time: z.string().trim().min(1).default(''),
  nsfw: z.object({
    current: z.number().int().min(0).default(0),
    max: z.number().int().min(1).default(20),
    details: NSFWDetailsSchema.optional(),
  }),
  scene: z.object({
    main: z.string().default(''),
    sub: z.string().default(''),
    stayRounds: z.number().int().min(0).default(0),
    topic: z.string().default(''),
  }),
  plot: z.string().default(''),
  relations: z.array(CharacterRelationSchema).default([]),
  events: z.array(StoryEventSchema).default([]),
  echoes: z.array(EchoSchema).default([]),
  todos: z.array(TodoSchema).default([]),
  archived: z.array(ArchivedNPCSchema).default([]),
  enigmas: z.array(EnigmaSchema).default([]),
  seeds: z.array(SeedSchema).default([]),
});

export type NSFWDetails = z.infer<typeof NSFWDetailsSchema>;
export type ClothingParts = z.infer<typeof ClothingPartsSchema>;
export type AppearanceParts = z.infer<typeof AppearancePartsSchema>;
export type CharacterRelation = z.infer<typeof CharacterRelationSchema>;
export type Echo = z.infer<typeof EchoSchema>;
export type Todo = z.infer<typeof TodoSchema>;
export type StoryEvent = z.infer<typeof StoryEventSchema>;
export type ArchivedNPC = z.infer<typeof ArchivedNPCSchema>;
export type Enigma = z.infer<typeof EnigmaSchema>;
export type Seed = z.infer<typeof SeedSchema>;
export type MeowDBEntry = z.infer<typeof MeowDBEntrySchema>;

export function createDefaultEntry(partial?: Partial<MeowDBEntry>): MeowDBEntry {
  return MeowDBEntrySchema.parse({
    ...partial,
    nsfw: { current: 0, max: 20, ...(partial?.nsfw ?? {}) },
    scene: { main: '', sub: '', stayRounds: 0, topic: '', ...(partial?.scene ?? {}) },
  });
}
