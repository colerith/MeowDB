export type StContext = Record<string, unknown> & {
  chat?: unknown[];
};

export function getStContext(): StContext | undefined {
  const st = (window as any).SillyTavern;
  return st?.getContext?.();
}

export async function saveChat(): Promise<void> {
  const st = (window as any).SillyTavern;
  if (typeof st?.saveChat === 'function') {
    await st.saveChat();
  }
}
