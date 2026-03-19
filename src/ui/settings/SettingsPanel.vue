<template>
  <div class="meowdb-drawer-body">
    <div class="drawer-header">
      <div class="meowdb-title">
        <i class="fa-solid fa-table-cells-large"></i>
        MeowDB 喵喵表格
      </div>
      <span class="meowdb-version">v0.1</span>
    </div>

    <div class="meowdb-tabs">
      <button class="meowdb-tab-btn active" type="button">
        <i class="fa-solid fa-gear"></i>
        <span>设置</span>
      </button>
      <button class="meowdb-tab-btn" type="button" disabled>
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>功能</span>
      </button>
      <button class="meowdb-tab-btn" type="button" disabled>
        <i class="fa-solid fa-database"></i>
        <span>数据</span>
      </button>
    </div>

    <div class="meowdb-tab-contents">
      <div class="meowdb-tab-content active">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

const { settings } = storeToRefs(useSettingsStore());
</script>
