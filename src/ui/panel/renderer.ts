import VisualPanel from '@/ui/panel/Panel.vue';

let app: ReturnType<typeof createApp> | null = null;
let mountedEl: Element | null = null;

export function renderPanel(target: HTMLElement) {
  if (mountedEl === target && app) return;

  if (app) {
    app.unmount();
    app = null;
    mountedEl = null;
  }

  target.innerHTML = '';
  app = createApp(VisualPanel);
  app.use(createPinia());
  app.mount(target);
  mountedEl = target;
}

export function unmountPanel() {
  if (!app) return;
  app.unmount();
  app = null;
  mountedEl = null;
}
