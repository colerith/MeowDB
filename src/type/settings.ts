export type Settings = z.infer<typeof Settings>;
export const Settings = z
  .object({
    enabled: z.boolean().default(true),
    auto_update: z.boolean().default(false),
    auto_update_interval: z.number().int().positive().default(1),

    api_enabled: z.boolean().default(false),
    api_url: z.string().default(''),
    api_key: z.string().default(''),
    api_model: z.string().default(''),
    api_temperature: z.number().min(0).max(2).default(0.7),
    api_max_tokens: z.number().int().positive().default(1200),

    relations_prompt: z.string().default(''),
  })
  .prefault({});

export const setting_field = 'meowdb';
