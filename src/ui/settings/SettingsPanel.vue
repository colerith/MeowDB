<template>
  <div class="meowdb-drawer-body">
    <div class="drawer-header">
      <div class="meowdb-title">
        <i class="fa-solid fa-table-cells-large"></i>
        MeowDB 喵喵表格
      </div>
      <span class="meowdb-version">v0.2</span>
    </div>

    <div class="meowdb-tabs meowdb-tabs-modal">
      <button
        class="meowdb-tab-btn"
        :class="{ active: activeTab === 'settings' }"
        type="button"
        @click="activeTab = 'settings'"
      >
        <i class="fa-solid fa-gear"></i>
        <span>设置</span>
      </button>
      <button
        class="meowdb-tab-btn"
        :class="{ active: activeTab === 'prompts' }"
        type="button"
        @click="activeTab = 'prompts'"
      >
        <i class="fa-solid fa-pen-to-square"></i>
        <span>提示词</span>
      </button>
      <button class="meowdb-tab-btn" type="button" disabled>
        <i class="fa-solid fa-database"></i>
        <span>数据</span>
      </button>
    </div>

    <div class="meowdb-tab-contents meowdb-modal-content-shell">
      <Transition name="meowdb-fade" mode="out-in">
        <div v-if="activeTab === 'settings'" key="settings" class="meowdb-tab-content active">
          <label class="meowdb-setting-row">
            <span>启用可视化面板</span>
            <input v-model="settings.enabled" type="checkbox" />
          </label>
          <label class="meowdb-setting-row">
            <span>自动更新</span>
            <input v-model="settings.auto_update" type="checkbox" />
          </label>
          <label class="meowdb-setting-row meowdb-setting-row-compact">
            <span>自动更新间隔（回合）</span>
            <div class="meowdb-inline-number">
              <input
                class="meowdb-input meowdb-input--xs"
                v-model.number="settings.auto_update_interval"
                type="number"
                min="1"
              />
              <small>轮</small>
            </div>
          </label>

          <hr class="sysHR" />

          <label class="meowdb-setting-row">
            <span>启用独立 API</span>
            <input v-model="settings.api_enabled" type="checkbox" />
          </label>
          <label class="meowdb-setting-row meowdb-setting-stack">
            <span>API URL</span>
            <input
              class="meowdb-input"
              v-model="settings.api_url"
              type="text"
              placeholder="https://api.openai.com/v1"
            />
          </label>
          <label class="meowdb-setting-row meowdb-setting-stack">
            <span>API Key</span>
            <input class="meowdb-input" v-model="settings.api_key" type="password" placeholder="sk-..." />
          </label>
          <label class="meowdb-setting-row meowdb-setting-stack">
            <span>Model</span>
            <input class="meowdb-input" v-model="settings.api_model" type="text" placeholder="gpt-4.1-mini" />
          </label>
          <label class="meowdb-setting-row">
            <span>Temperature</span>
            <input
              class="meowdb-input meowdb-input--xs"
              v-model.number="settings.api_temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
            />
          </label>
          <label class="meowdb-setting-row">
            <span>Max Tokens</span>
            <input
              class="meowdb-input meowdb-input--xs"
              v-model.number="settings.api_max_tokens"
              type="number"
              min="128"
              step="64"
            />
          </label>

          <hr class="sysHR" />

          <div class="meowdb-tools">
            <button class="menu_button meowdb-tool-btn" :disabled="injecting" @click="injectSample">
              {{ injecting ? '注入中...' : '注入示例数据' }}
            </button>
            <button class="menu_button meowdb-tool-btn danger" :disabled="clearing" @click="clearAll">
              {{ clearing ? '清空中...' : '清空当前聊天数据' }}
            </button>
          </div>
        </div>

        <div v-else key="prompts" class="meowdb-tab-content active">
          <div class="meowdb-prompt-head">
            <h4>数据更新提示词</h4>
            <button class="menu_button meowdb-tool-btn" type="button" @click="restoreRelationsPrompt">还原默认</button>
          </div>

          <p class="meowdb-prompt-hint">当前先开放 `relations_json` 提示词，可直接修改后用于 AI 更新。</p>

          <label class="meowdb-setting-row meowdb-setting-stack">
            <span>relations 提示词</span>
            <textarea
              class="meowdb-input meowdb-prompt-textarea"
              v-model="settings.relations_prompt"
              rows="13"
              placeholder="留空将使用默认 relations 提示词"
            />
          </label>

          <div class="meowdb-prompt-meta">
            <span>字符数：{{ settings.relations_prompt?.length || 0 }}</span>
            <span>留空 = 使用内置默认</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sampleEntry } from '@/data/sample-entry';
import { DEFAULT_RELATIONS_PROMPT } from '@/modules/ai-updater/prompt-builder';
import { clearAllEntries, saveCurrentEntry } from '@/modules/data-manager';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

const { settings } = storeToRefs(useSettingsStore());
const activeTab = ref<'settings' | 'prompts'>('settings');
const injecting = ref(false);
const clearing = ref(false);

async function injectSample() {
  if (injecting.value) return;
  injecting.value = true;

  const ok = await saveCurrentEntry(sampleEntry);
  injecting.value = false;

  if (!ok) {
    toastr.error('示例数据注入失败');
    return;
  }

  toastr.success('示例数据已注入');
}

async function clearAll() {
  if (clearing.value) return;
  clearing.value = true;

  const cleared = await clearAllEntries();
  clearing.value = false;

  toastr.success(cleared > 0 ? `已清空 ${cleared} 条 MeowDB 数据` : '当前聊天没有可清空的 MeowDB 数据');
}

function restoreRelationsPrompt() {
  settings.value.relations_prompt = DEFAULT_RELATIONS_PROMPT;
  toastr.success('已还原默认 relations 提示词');
}
</script>
