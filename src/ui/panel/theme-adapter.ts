export function applyThemeVars(vars: Record<string, string>) {
  const panel = document.querySelector('.meow-db-panel') as HTMLElement | null;
  if (!panel) return;
  for (const [key, val] of Object.entries(vars)) {
    panel.style.setProperty(`--meow-${key}`, val);
  }
}
