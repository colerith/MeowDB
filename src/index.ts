import '@/global.css';
<<<<<<< HEAD
import '@/styles/meowdb-theme.css';
import { initAutoReloadOnExtensionUpdate } from '@/core/auto-reload-on-update';
import { initPanel } from '@/ui/panel';
import { initSettingsUI } from '@/ui/settings';

$(() => {
  initAutoReloadOnExtensionUpdate();
  initSettingsUI();
=======
import { initPanel } from '@/panel';

$(() => {
>>>>>>> 594877de3d6ea4230111d3f97f6ef22c7409b0c6
  initPanel();
});
