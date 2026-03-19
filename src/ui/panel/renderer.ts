import VisualPanel from '@/ui/panel/Panel.vue';

let app: ReturnType<typeof createApp> | null = null;
let mountedEl: Element | null = null;

export function renderPanel(target: HTMLElement) {
  if (mountedEl === target) return;

  if (!app) {
    app = createApp(VisualPanel);
    app.use(createPinia());
  }

  target.innerHTML = '';
  mountedEl = target;
  app.mount(target);
}
