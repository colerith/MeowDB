export type Settings = z.infer<typeof Settings>;
export const Settings = z
  .object({
    enabled: z.boolean().default(true),
    auto_update: z.boolean().default(false),
    auto_update_interval: z.number().int().positive().default(1),
  })
  .prefault({});

export const setting_field = 'meowdb';
