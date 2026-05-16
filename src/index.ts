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
>>>>>>> 5f16239387e93ce6f432daceec2bce3ebd350bbd
  initPanel();
});
