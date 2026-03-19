import type { PromptPayload } from '@/modules/ai-updater/prompt-builder';

export interface AiCallerConfig {
  api_enabled: boolean;
  api_url: string;
  api_key: string;
  api_model: string;
  api_temperature: number;
  api_max_tokens: number;
}

export async function callApi(prompt: PromptPayload, config: AiCallerConfig): Promise<string> {
  if (!config.api_enabled) {
    throw new Error('独立 API 未启用，请先在设置中开启。');
  }

  if (!config.api_url || !config.api_model) {
    throw new Error('请先配置 API URL 和 Model。');
  }

  const endpoint = buildChatCompletionsUrl(config.api_url);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.api_key ? { Authorization: `Bearer ${config.api_key}` } : {}),
    },
    body: JSON.stringify({
      model: config.api_model,
      temperature: config.api_temperature,
      max_tokens: config.api_max_tokens,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    }),
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(`API 调用失败(${response.status}): ${reason}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('API 返回为空。');
  }

  return content;
}

function buildChatCompletionsUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, '');
  if (normalized.endsWith('/chat/completions')) return normalized;
  return `${normalized}/chat/completions`;
}
