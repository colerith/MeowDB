import '@/global.css';
import { initPanel } from '@/ui/panel';
import { initSettingsUI } from '@/ui/settings';

$(() => {
  initSettingsUI();
  initPanel();
});
