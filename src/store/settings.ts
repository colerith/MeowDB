<<<<<<< HEAD
﻿import { setting_field, Settings } from '@/type/settings';
=======
import { setting_field, Settings } from '@/type/settings';
>>>>>>> e000f17401bc15121c7e98e8b74f8f69bb0ff16c
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

<<<<<<< HEAD
export const useSettingsStore = defineStore('meowdb_settings', () => {
=======
export const useSettingsStore = defineStore('settings', () => {
>>>>>>> e000f17401bc15121c7e98e8b74f8f69bb0ff16c
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  watch(
    settings,
<<<<<<< HEAD
    newSettings => {
      _.set(extension_settings, setting_field, klona(newSettings));
=======
    new_settings => {
      _.set(extension_settings, setting_field, klona(new_settings)); // 用 klona 克隆对象从而去除 proxy 层
>>>>>>> e000f17401bc15121c7e98e8b74f8f69bb0ff16c
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
>>>>>>> e000f17401bc15121c7e98e8b74f8f69bb0ff16c
});
