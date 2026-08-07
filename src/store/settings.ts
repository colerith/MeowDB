<<<<<<< HEAD
﻿import { setting_field, Settings } from '@/type/settings';
=======
import { setting_field, Settings } from '@/type/settings';
>>>>>>> c78877ecbba1ceb5d7507f33bcd5d55b9fb9431b
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

<<<<<<< HEAD
export const useSettingsStore = defineStore('meowdb_settings', () => {
=======
export const useSettingsStore = defineStore('settings', () => {
>>>>>>> c78877ecbba1ceb5d7507f33bcd5d55b9fb9431b
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  watch(
    settings,
<<<<<<< HEAD
    newSettings => {
      _.set(extension_settings, setting_field, klona(newSettings));
=======
    new_settings => {
      _.set(extension_settings, setting_field, klona(new_settings)); // 用 klona 克隆对象从而去除 proxy 层
>>>>>>> c78877ecbba1ceb5d7507f33bcd5d55b9fb9431b
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
>>>>>>> c78877ecbba1ceb5d7507f33bcd5d55b9fb9431b
});
