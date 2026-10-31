<<<<<<< HEAD
﻿import { setting_field, Settings } from '@/type/settings';
=======
import { setting_field, Settings } from '@/type/settings';
>>>>>>> c169052efec404f90d9d8a4c05ee9da792154bda
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

<<<<<<< HEAD
export const useSettingsStore = defineStore('meowdb_settings', () => {
=======
export const useSettingsStore = defineStore('settings', () => {
>>>>>>> c169052efec404f90d9d8a4c05ee9da792154bda
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  watch(
    settings,
<<<<<<< HEAD
    newSettings => {
      _.set(extension_settings, setting_field, klona(newSettings));
=======
    new_settings => {
      _.set(extension_settings, setting_field, klona(new_settings)); // 用 klona 克隆对象从而去除 proxy 层
>>>>>>> c169052efec404f90d9d8a4c05ee9da792154bda
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
>>>>>>> c169052efec404f90d9d8a4c05ee9da792154bda
});
