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
  const icon = drawer.querySelector(`#${DRAWER_ICON_ID}`) as HTMLElement | null;
  const content = drawer.querySelector(`#${DRAWER_CONTENT_ID}`) as HTMLElement | null;
  if (!icon || !content) return;

  mountSettingsApp(content);

  if (!icon.dataset.bound) {
    icon.dataset.bound = 'true';
    icon.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const willClose = !content.classList.contains('closedDrawer');
      setDrawerState(content, icon, willClose);
    });
  }

  if (!drawer.dataset.boundOutside) {
    drawer.dataset.boundOutside = 'true';
    document.addEventListener('click', event => {
      if (!(event.target instanceof Node)) return;
      if (drawer.contains(event.target)) return;
      setDrawerState(content, icon, true);
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
      <div id="${DRAWER_ICON_ID}" class="drawer-icon fa-solid fa-table-cells-large fa-fw closedIcon interactable" title="MeowDB 设置" tabindex="0" role="button"></div>
    </div>
    <div id="${DRAWER_CONTENT_ID}" class="drawer-content closedDrawer"></div>
  `;

  holder.appendChild(drawer);
  return drawer;
}

function setDrawerState(content: HTMLElement, icon: HTMLElement, closed: boolean) {
  content.classList.toggle('closedDrawer', closed);
  icon.classList.toggle('closedIcon', closed);
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
