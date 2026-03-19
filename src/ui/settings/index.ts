import SettingsPanel from '@/ui/settings/SettingsPanel.vue';

const DRAWER_ID = 'MeowDB_drawer';
const DRAWER_ICON_ID = 'MeowDB_drawer_icon';
const DRAWER_CONTENT_ID = 'MeowDB_drawer_content';
const SETTINGS_MOUNT_ID = 'meowdb-top-settings-mount';

let app: ReturnType<typeof createApp> | null = null;

export function initSettingsUI() {
  const holder = document.querySelector('#top-settings-holder') as HTMLElement | null;
  if (!holder) return;

  const drawer = ensureDrawer(holder);
  const toggle = drawer.querySelector('.drawer-toggle') as HTMLElement | null;
  const icon = drawer.querySelector(`#${DRAWER_ICON_ID}`) as HTMLElement | null;
  const content = drawer.querySelector(`#${DRAWER_CONTENT_ID}`) as HTMLElement | null;
  if (!toggle || !icon || !content) return;

  mountSettingsApp(content);
  applyDrawerState(content, icon, true);

  if (!drawer.dataset.boundToggle) {
    drawer.dataset.boundToggle = 'true';

    const onToggle = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleDrawer(content, icon);
    };

    toggle.addEventListener('click', onToggle);
    icon.addEventListener('click', onToggle);

    icon.addEventListener('keydown', event => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      onToggle(event);
    });
  }

  if (!drawer.dataset.boundOutside) {
    drawer.dataset.boundOutside = 'true';
    document.addEventListener('click', event => {
      if (!(event.target instanceof Node)) return;
      if (drawer.contains(event.target)) return;
      applyDrawerState(content, icon, true);
    });
  }
}

function ensureDrawer(holder: HTMLElement): HTMLElement {
  let drawer = holder.querySelector(`#${DRAWER_ID}`) as HTMLElement | null;
  if (drawer) return drawer;

  drawer = document.createElement('div');
  drawer.id = DRAWER_ID;
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer-toggle">
      <div id="${DRAWER_ICON_ID}" class="drawer-icon fa-solid fa-table-cells-large fa-fw closedIcon interactable" title="MeowDB 设置" tabindex="0" role="button" aria-expanded="false"></div>
    </div>
    <div id="${DRAWER_CONTENT_ID}" class="drawer-content closedDrawer"></div>
  `;

  holder.appendChild(drawer);
  return drawer;
}

function toggleDrawer(content: HTMLElement, icon: HTMLElement) {
  const currentlyClosed = content.classList.contains('closedDrawer');
  applyDrawerState(content, icon, !currentlyClosed);
}

function applyDrawerState(content: HTMLElement, icon: HTMLElement, closed: boolean) {
  content.classList.toggle('closedDrawer', closed);
  icon.classList.toggle('closedIcon', closed);
  icon.setAttribute('aria-expanded', String(!closed));

  // Fallback for themes where closedDrawer/open styles are overridden.
  content.style.display = closed ? 'none' : 'block';
}

function mountSettingsApp(content: HTMLElement) {
  let mount = content.querySelector(`#${SETTINGS_MOUNT_ID}`) as HTMLElement | null;
  if (!mount) {
    mount = document.createElement('div');
    mount.id = SETTINGS_MOUNT_ID;
    content.appendChild(mount);
  }

  if (mount.childElementCount > 0) return;

  if (!app) {
    app = createApp(SettingsPanel);
    app.use(createPinia());
  }

  app.mount(mount);
}
