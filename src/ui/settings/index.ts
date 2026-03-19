import SettingsPanel from '@/ui/settings/SettingsPanel.vue';

const TOP_DRAWER_ID = 'MeowDB_drawer';
const TOP_ICON_ID = 'MeowDB_drawer_icon';
const TOP_DUMMY_CONTENT_ID = 'MeowDB_drawer_content';
const MODAL_OVERLAY_ID = 'MeowDB_settings_overlay';
const MODAL_ROOT_ID = 'MeowDB_settings_root';

let app: ReturnType<typeof createApp> | null = null;

export function initSettingsUI() {
  const holder = document.querySelector('#top-settings-holder') as HTMLElement | null;
  if (!holder) return;

  const drawer = ensureTopDrawer(holder);
  const icon = drawer.querySelector(`#${TOP_ICON_ID}`) as HTMLElement | null;
  if (!icon) return;

  const overlay = ensureModalOverlay();
  mountSettingsApp();
  bindModalEvents(icon, overlay);
}

function ensureTopDrawer(holder: HTMLElement): HTMLElement {
  let drawer = holder.querySelector(`#${TOP_DRAWER_ID}`) as HTMLElement | null;

  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = TOP_DRAWER_ID;
    drawer.className = 'drawer';
    drawer.innerHTML = `
      <div class="drawer-toggle">
        <div id="${TOP_ICON_ID}" class="drawer-icon fa-solid fa-table-cells-large fa-fw closedIcon interactable" title="MeowDB 设置" tabindex="0" role="button"></div>
      </div>
      <div id="${TOP_DUMMY_CONTENT_ID}" class="drawer-content closedDrawer meowdb-dummy-drawer"></div>
    `;
  }

  placeBeforeLastDrawer(holder, drawer);
  return drawer;
}

function placeBeforeLastDrawer(holder: HTMLElement, drawer: HTMLElement) {
  const otherDrawers = Array.from(holder.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('drawer') && el.id !== TOP_DRAWER_ID,
  );

  const lastDrawer = otherDrawers.at(-1);
  if (lastDrawer) {
    holder.insertBefore(drawer, lastDrawer);
    return;
  }

  holder.appendChild(drawer);
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

    icon.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openModal(overlay, icon);
    });

    icon.addEventListener('keydown', event => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
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

function mountSettingsApp() {
  const mount = document.querySelector(`#${MODAL_ROOT_ID}`) as HTMLElement | null;
  if (!mount) return;
  if (mount.childElementCount > 0) return;

  if (!app) {
    app = createApp(SettingsPanel);
    app.use(createPinia());
  }

  app.mount(mount);
}
