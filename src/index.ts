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
>>>>>>> 7d7e61fe11eb4e8d4b0d0704aca40706ae5622a8
  initPanel();
});
