import { setting_field, Settings } from '@/type/settings';
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

export const useSettingsStore = defineStore('meowdb_settings', () => {
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  watch(
    settings,
    newSettings => {
      _.set(extension_settings, setting_field, klona(newSettings));
      saveSettingsDebounced();
    },
    { deep: true },
  );

  return { settings };
});
