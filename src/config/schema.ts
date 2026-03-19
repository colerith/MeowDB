import { z } from 'zod';

export const MeowDBConfigSchema = z.object({
  api: z.object({
    enabled: z.boolean().default(false),
    url: z.string().default(''),
    key: z.string().default(''),
    model: z.string().default(''),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().positive().default(2048),
  }),
  trigger: z.object({
    autoUpdate: z.boolean().default(false),
    autoUpdateInterval: z.number().int().positive().default(1),
    summarizeThreshold: z.number().int().positive().default(10),
    manualConfirm: z.boolean().default(true),
  }),
  display: z.object({
    enabled: z.boolean().default(true),
    position: z.enum(['below_last', 'fixed_bottom']).default('below_last'),
    collapsedModules: z.array(z.string()).default([]),
    showNSFW: z.boolean().default(true),
    showEnigma: z.boolean().default(true),
    cardWidth: z.number().int().positive().default(280),
  }),
  template: z.object({
    nsfwMax: z.number().int().positive().default(20),
    echoesMax: z.number().int().positive().default(10),
    seedsMax: z.number().int().positive().default(5),
    plotMinLength: z.number().int().positive().default(150),
    plotMaxLength: z.number().int().positive().default(300),
  }),
});

export type MeowDBConfig = z.infer<typeof MeowDBConfigSchema>;
