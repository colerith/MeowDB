import { extension_settings } from '@sillytavern/scripts/extensions';
import { setting_field } from '@/type/settings';
import { ensurePanelContainer, remountPanelContainer, removePanelContainer } from '@/ui/panel/container';
import { renderPanel, unmountPanel } from '@/ui/panel/renderer';

let observer: MutationObserver | null = null;

export function initPanel() {
  if (!isPanelEnabled()) {
    unmountPanel();
    removePanelContainer();
    observeChatChanges();
    return;
  }

  const container = ensurePanelContainer();
  renderPanel(container);
  observeChatChanges();
}

function observeChatChanges() {
  if (observer) return;

  observer = new MutationObserver(() => {
    if (!isPanelEnabled()) {
      unmountPanel();
      removePanelContainer();
      return;
    }

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

function isPanelEnabled(): boolean {
  const rawSettings = _.get(extension_settings, setting_field) as { enabled?: boolean } | undefined;
  return rawSettings?.enabled !== false;
}
