import { z } from 'zod';

export const NSFWDetailsSchema = z.record(z.string(), z.unknown()).default({});

export const CharacterRelationSchema = z.object({
  name: z.string().trim().min(1),
  gender: z.string().default(''),
  genitalStatus: z.string().default(''),
  identity: z.string().default(''),
  personality: z.string().default(''),
  sexExp: z.string().default(''),
  coordinate: z.string().default(''),
  clothing: z.string().default(''),
  action: z.string().default(''),
  bond: z.string().default(''),
  favor: z.number().default(0),
  favorChange: z.string().default(''),
});

export const EchoSchema = z.object({
  character: z.string().trim().min(1),
  content: z.string().trim().min(1),
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
  echoes: z.array(EchoSchema).default([]),
  archived: z.array(ArchivedNPCSchema).default([]),
  enigmas: z.array(EnigmaSchema).default([]),
  seeds: z.array(SeedSchema).default([]),
});

export type NSFWDetails = z.infer<typeof NSFWDetailsSchema>;
export type CharacterRelation = z.infer<typeof CharacterRelationSchema>;
export type Echo = z.infer<typeof EchoSchema>;
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
