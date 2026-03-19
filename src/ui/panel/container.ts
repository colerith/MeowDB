import { mountAfterLastMes } from '@/utils/dom-helpers';

export function ensurePanelContainer(): HTMLElement {
  let container = document.querySelector('.meow-db-panel') as HTMLElement | null;
  if (!container) {
    container = document.createElement('div');
    container.className = 'meow-db-panel';
  }

  mountAfterLastMes(container);
  return container;
}

export function remountPanelContainer(): HTMLElement | null {
  const container = document.querySelector('.meow-db-panel') as HTMLElement | null;
  if (!container) return null;

  mountAfterLastMes(container);
  return container;
}
