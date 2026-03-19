import SettingsPanel from '@/ui/settings/SettingsPanel.vue';

const TOP_ENTRY_ID = 'MeowDB_top_entry';
const TOP_ICON_ID = 'MeowDB_top_icon';
const MODAL_OVERLAY_ID = 'MeowDB_settings_overlay';
const MODAL_ROOT_ID = 'MeowDB_settings_root';

let app: ReturnType<typeof createApp> | null = null;

export function initSettingsUI() {
  const holder = document.querySelector('#top-settings-holder') as HTMLElement | null;
  if (!holder) return;

  const entry = ensureTopIconEntry(holder);
  const icon = entry.querySelector(`#${TOP_ICON_ID}`) as HTMLElement | null;
  if (!icon) return;

  const overlay = ensureModalOverlay();
  mountSettingsApp(overlay);
  bindModalEvents(icon, overlay);
}

function ensureTopIconEntry(holder: HTMLElement): HTMLElement {
  let entry = holder.querySelector(`#${TOP_ENTRY_ID}`) as HTMLElement | null;

  if (!entry) {
    entry = document.createElement('div');
    entry.id = TOP_ENTRY_ID;
    entry.className = 'meowdb-top-entry';
    entry.innerHTML = `<div id="${TOP_ICON_ID}" class="drawer-icon fa-solid fa-table-cells-large fa-fw closedIcon interactable" title="MeowDB 设置" tabindex="0" role="button"></div>`;
  }

  placeBeforeLastDrawer(holder, entry);
  return entry;
}

function placeBeforeLastDrawer(holder: HTMLElement, entry: HTMLElement) {
  const otherDrawers = Array.from(holder.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('drawer'),
  );

  const lastDrawer = otherDrawers.at(-1);
  if (lastDrawer) {
    holder.insertBefore(entry, lastDrawer);
    return;
  }

  holder.appendChild(entry);
}

function ensureModalOverlay(): HTMLElement {
  let overlay = document.querySelector(`#${MODAL_OVERLAY_ID}`) as HTMLElement | null;
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = MODAL_OVERLAY_ID;
  overlay.className = 'meowdb-modal-overlay';
  overlay.innerHTML = `
    <div class="meowdb-modal" role="dialog" aria-modal="true" aria-label="MeowDB 设置">
      <button type="button" class="meowdb-modal-close interactable" title="关闭">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div id="${MODAL_ROOT_ID}"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function bindModalEvents(icon: HTMLElement, overlay: HTMLElement) {
  if (!icon.dataset.bound) {
    icon.dataset.bound = 'true';
    icon.addEventListener('click', () => openModal(overlay, icon));
    icon.addEventListener('keydown', event => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openModal(overlay, icon);
    });
  }

  if (!overlay.dataset.bound) {
    overlay.dataset.bound = 'true';

    overlay.addEventListener('click', event => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.classList.contains('meowdb-modal-overlay')) {
        closeModal(overlay, icon);
      }
    });

    const closeBtn = overlay.querySelector('.meowdb-modal-close') as HTMLElement | null;
    closeBtn?.addEventListener('click', () => closeModal(overlay, icon));

    document.addEventListener('keydown', event => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== 'Escape') return;
      if (!overlay.classList.contains('open')) return;
      closeModal(overlay, icon);
    });
  }
}

function openModal(overlay: HTMLElement, icon: HTMLElement) {
  overlay.classList.add('open');
  icon.classList.remove('closedIcon');
  icon.classList.add('openIcon');
}

function closeModal(overlay: HTMLElement, icon: HTMLElement) {
  overlay.classList.remove('open');
  icon.classList.remove('openIcon');
  icon.classList.add('closedIcon');
}

function mountSettingsApp(_overlay: HTMLElement) {
  const mount = document.querySelector(`#${MODAL_ROOT_ID}`) as HTMLElement | null;
  if (!mount) return;
  if (mount.childElementCount > 0) return;

  if (!app) {
    app = createApp(SettingsPanel);
    app.use(createPinia());
  }

  app.mount(mount);
}
