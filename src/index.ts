import '@/global.css';
import '@/styles/meowdb-theme.css';
import { initPanel } from '@/ui/panel';
import { initSettingsUI } from '@/ui/settings';

$(() => {
  initSettingsUI();
  initPanel();
});
