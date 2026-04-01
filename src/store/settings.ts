<<<<<<< HEAD
﻿import { setting_field, Settings } from '@/type/settings';
=======
import { setting_field, Settings } from '@/type/settings';
>>>>>>> 89e6619ff6af0deab79d5e1d0a6dd40271b872b0
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

<<<<<<< HEAD
export const useSettingsStore = defineStore('meowdb_settings', () => {
=======
export const useSettingsStore = defineStore('settings', () => {
>>>>>>> 89e6619ff6af0deab79d5e1d0a6dd40271b872b0
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  watch(
    settings,
<<<<<<< HEAD
    newSettings => {
      _.set(extension_settings, setting_field, klona(newSettings));
=======
    new_settings => {
      _.set(extension_settings, setting_field, klona(new_settings)); // 用 klona 克隆对象从而去除 proxy 层
>>>>>>> 89e6619ff6af0deab79d5e1d0a6dd40271b872b0
      saveSettingsDebounced();
    },
    { deep: true },
  );
<<<<<<< HEAD

  return { settings };
=======
  return {
    settings,
  };
>>>>>>> 89e6619ff6af0deab79d5e1d0a6dd40271b872b0
});
