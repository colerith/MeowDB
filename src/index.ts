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
>>>>>>> 65430db269f06495b7dcf93a3c9a103492846134
  initPanel();
});
