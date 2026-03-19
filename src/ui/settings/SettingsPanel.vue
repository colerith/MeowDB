<template>
  <section class="meowdb-settings-shell">
    <h3>MeowDB 设置</h3>
    <label class="meowdb-setting-row">
      <span>启用可视化面板</span>
      <input v-model="settings.enabled" type="checkbox" />
    </label>
    <label class="meowdb-setting-row">
      <span>自动更新</span>
      <input v-model="settings.auto_update" type="checkbox" />
    </label>
    <label class="meowdb-setting-row">
      <span>自动更新间隔（回合）</span>
      <input v-model.number="settings.auto_update_interval" type="number" min="1" />
    </label>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

const { settings } = storeToRefs(useSettingsStore());
</script>
