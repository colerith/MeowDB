import { mountAfterLastMes } from '@/utils/dom-helpers';

let widthObserver: ResizeObserver | null = null;

function syncPanelWidth(container: HTMLElement): void {
  if (!document.body.classList.contains('bubblechat')) {
    container.style.width = '';
    container.style.marginLeft = '';
    container.style.maxWidth = '100%';
    return;
  }

  const chat = document.querySelector('#chat') as HTMLElement | null;
  const lastMes = chat?.querySelector('.mes.last_mes') as HTMLElement | null;
  if (!chat || !lastMes) return;

  const width = lastMes.getBoundingClientRect().width;
  if (width > 0) {
    container.style.width = `${Math.round(width)}px`;
  }

  container.style.maxWidth = '100%';
  container.style.marginLeft = `${lastMes.offsetLeft}px`;
}

function observePanelWidth(container: HTMLElement): void {
  const chat = document.querySelector('#chat') as HTMLElement | null;
  const lastMes = chat?.querySelector('.mes.last_mes') as HTMLElement | null;
  if (!chat || !lastMes || typeof ResizeObserver === 'undefined') return;

  if (widthObserver) {
    widthObserver.disconnect();
  }

  widthObserver = new ResizeObserver(() => {
    syncPanelWidth(container);
  });

  widthObserver.observe(lastMes);
  widthObserver.observe(chat);
}

export function ensurePanelContainer(): HTMLElement {
  let container = document.querySelector('.meow-db-panel') as HTMLElement | null;
  if (!container) {
    container = document.createElement('div');
    container.className = 'meow-db-panel';
  }

  mountAfterLastMes(container);
  syncPanelWidth(container);
  observePanelWidth(container);
  return container;
}

export function remountPanelContainer(): HTMLElement | null {
  const container = document.querySelector('.meow-db-panel') as HTMLElement | null;
  if (!container) return null;

  mountAfterLastMes(container);
  syncPanelWidth(container);
  observePanelWidth(container);
  return container;
}

export function removePanelContainer(): void {
  if (widthObserver) {
    widthObserver.disconnect();
    widthObserver = null;
  }

  const container = document.querySelector('.meow-db-panel') as HTMLElement | null;
  container?.remove();
}
