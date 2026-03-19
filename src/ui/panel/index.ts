import { ensurePanelContainer, remountPanelContainer } from '@/ui/panel/container';
import { renderPanel } from '@/ui/panel/renderer';

let observer: MutationObserver | null = null;

export function initPanel() {
  const container = ensurePanelContainer();
  renderPanel(container);
  observeChatChanges();
}

function observeChatChanges() {
  if (observer) return;

  observer = new MutationObserver(() => {
    const container = remountPanelContainer();
    if (container) {
      renderPanel(container);
      return;
    }

    const freshContainer = ensurePanelContainer();
    renderPanel(freshContainer);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
