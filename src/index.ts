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
>>>>>>> 24a3e3531e97af09ee10d904c18246cfb052f426
  initPanel();
});
