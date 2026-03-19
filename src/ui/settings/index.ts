import SettingsPanel from '@/ui/settings/SettingsPanel.vue';

const SETTINGS_BTN_ID = 'meowdb-top-settings-btn';
const SETTINGS_DRAWER_ID = 'meowdb-top-settings-drawer';
const SETTINGS_MOUNT_ID = 'meowdb-top-settings-mount';

let app: ReturnType<typeof createApp> | null = null;

export function initSettingsUI() {
  const holder = document.querySelector('#top-settings-holder');
  if (!holder) return;

  const button = ensureSettingsButton(holder as HTMLElement);
  const drawer = ensureDrawer(holder as HTMLElement);
  mountSettingsApp(drawer);

  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    drawer.classList.toggle('open');
  });

  document.addEventListener('click', event => {
    if (!(event.target instanceof Node)) return;
    if (button.contains(event.target) || drawer.contains(event.target)) return;
    drawer.classList.remove('open');
  });
}

function ensureSettingsButton(holder: HTMLElement): HTMLButtonElement {
  let button = holder.querySelector(`#${SETTINGS_BTN_ID}`) as HTMLButtonElement | null;
  if (button) return button;

  button = document.createElement('button');
  button.id = SETTINGS_BTN_ID;
  button.className = 'menu_button fa-solid fa-table-cells-large interactable meowdb-top-btn';
  button.type = 'button';
  button.title = 'MeowDB 设置';
  holder.appendChild(button);
  return button;
}

function ensureDrawer(holder: HTMLElement): HTMLElement {
  let drawer = document.querySelector(`#${SETTINGS_DRAWER_ID}`) as HTMLElement | null;
  if (drawer) return drawer;

  drawer = document.createElement('div');
  drawer.id = SETTINGS_DRAWER_ID;
  drawer.className = 'drawer meowdb-settings-drawer';

  const mount = document.createElement('div');
  mount.id = SETTINGS_MOUNT_ID;
  drawer.appendChild(mount);

  holder.appendChild(drawer);
  return drawer;
}

function mountSettingsApp(drawer: HTMLElement) {
  const mount = drawer.querySelector(`#${SETTINGS_MOUNT_ID}`) as HTMLElement | null;
  if (!mount) return;
  if (mount.childElementCount > 0) return;

  if (!app) {
    app = createApp(SettingsPanel);
    app.use(createPinia());
  }

  app.mount(mount);
}
