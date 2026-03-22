export type Settings = z.infer<typeof Settings>;

const ApiProfile = z.object({
  id: z.string().default(''),
  name: z.string().default('默认配置'),
  enabled: z.boolean().default(false),
  url: z.string().default(''),
  key: z.string().default(''),
  model: z.string().default(''),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().positive().default(1200),
});

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
    api_profiles: z.array(ApiProfile).default([]),
    api_active_profile_id: z.string().default(''),

    relations_prompt: z.string().default(''),
    events_prompt: z.string().default(''),
    echoes_prompt: z.string().default(''),
    relation_colors: z.array(z.string()).length(5).default(['#7dd3fc', '#f9a8d4', '#86efac', '#fcd34d', '#c4b5fd']),

    visual_panel_collapsed: z.boolean().default(false),
    visual_active_tab: z.enum(['status', 'events', 'relations', 'echoes', 'settings']).default('status'),
  })
  .prefault({});

export const setting_field = 'meowdb';
