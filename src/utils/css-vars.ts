export function readCssVar(name: string): string {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(name).trim();
}
