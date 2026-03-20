<template>
  <div class="meowdb-drawer-body">
    <div class="drawer-header">
      <div class="meowdb-title">
        <i class="fa-solid fa-table-cells-large"></i>
        MeowDB 喵喵表格
      </div>
      <span class="meowdb-version">v0.3</span>
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
          <section class="meowdb-settings-section">
            <h4 class="meowdb-setting-title">基础设置</h4>
            <label class="meowdb-setting-row">
              <span>启用可视化面板</span>
              <input v-model="settings.enabled" type="checkbox" class="meowdb-check" />
            </label>
            <label class="meowdb-setting-row">
              <span>自动更新</span>
              <input v-model="settings.auto_update" type="checkbox" class="meowdb-check" />
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
          </section>

          <section class="meowdb-settings-section">
            <h4 class="meowdb-setting-title">独立 API</h4>
            <label class="meowdb-setting-row">
              <span>启用独立 API</span>
              <input v-model="settings.api_enabled" type="checkbox" class="meowdb-check" />
            </label>

            <div class="meowdb-profile-toolbar">
              <label class="meowdb-setting-stack meowdb-profile-field">
                <span>配置方案</span>
                <select class="meowdb-input" v-model="settings.api_active_profile_id">
                  <option v-for="profile in apiProfiles" :key="profile.id" :value="profile.id">
                    {{ profile.name }}
                  </option>
                </select>
              </label>
            </div>

            <div class="meowdb-setting-actions">
              <button class="menu_button meowdb-tool-btn" type="button" @click="saveAsNewProfile">新建方案</button>
              <button class="menu_button meowdb-tool-btn" type="button" @click="renameCurrentProfile">重命名</button>
              <button class="menu_button meowdb-tool-btn" type="button" @click="updateCurrentProfile">保存方案</button>
              <button class="menu_button meowdb-tool-btn" type="button" @click="exportCurrentProfile">导出</button>
              <button class="menu_button meowdb-tool-btn" type="button" @click="triggerImportProfile">导入</button>
              <button
                class="menu_button meowdb-tool-btn danger"
                type="button"
                :disabled="apiProfiles.length <= 1"
                @click="removeCurrentProfile"
              >
                删除
              </button>
              <input
                ref="profileImportInput"
                type="file"
                accept="application/json,.json"
                style="display: none"
                @change="onImportProfileFile"
              />
            </div>

            <div class="meowdb-setting-grid-2">
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
            </div>

            <label class="meowdb-setting-row meowdb-setting-stack">
              <span>模型</span>
              <div class="meowdb-model-row">
                <input
                  class="meowdb-input"
                  v-model="settings.api_model"
                  type="text"
                  list="meowdb-model-options"
                  placeholder="gpt-4.1-mini"
                />
                <button
                  class="menu_button meowdb-tool-btn"
                  type="button"
                  :disabled="fetchingModels"
                  @click="fetchModels"
                >
                  {{ fetchingModels ? '拉取中...' : '手动拉取模型' }}
                </button>
                <button
                  class="menu_button meowdb-tool-btn"
                  type="button"
                  :disabled="testingConnection"
                  @click="testConnection"
                >
                  {{ testingConnection ? '测试中...' : '连接测试' }}
                </button>
              </div>
              <datalist id="meowdb-model-options">
                <option v-for="model in modelOptions" :key="model" :value="model" />
              </datalist>
            </label>

            <div class="meowdb-setting-grid-2">
              <label class="meowdb-setting-row meowdb-setting-stack">
                <span>温度</span>
                <input
                  class="meowdb-input meowdb-input--xs"
                  v-model.number="settings.api_temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                />
              </label>
              <label class="meowdb-setting-row meowdb-setting-stack">
                <span>最大上下文长度</span>
                <input
                  class="meowdb-input meowdb-input--xs"
                  v-model.number="settings.api_max_tokens"
                  type="number"
                  min="128"
                  step="64"
                />
              </label>
            </div>
          </section>

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
          <section class="meowdb-prompt-card">
            <header class="meowdb-prompt-card-head">
              <div>
                <h4>Relations 更新提示词</h4>
                <p>用于 AI 更新角色关系、服饰/外貌拆解和手动字段保护逻辑。</p>
              </div>
              <button class="menu_button meowdb-tool-btn" type="button" @click="restoreRelationsPrompt">
                恢复默认
              </button>
            </header>

            <textarea
              class="meowdb-input meowdb-prompt-textarea"
              v-model="settings.relations_prompt"
              rows="18"
              placeholder="留空将使用默认 relations 提示词"
            />

            <div class="meowdb-prompt-meta">
              <span>字符数：{{ settings.relations_prompt?.length || 0 }}</span>
              <span>留空 = 使用内置默认</span>
            </div>
          </section>
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

interface ApiProfile {
  id: string;
  name: string;
  enabled: boolean;
  url: string;
  key: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

const { settings } = storeToRefs(useSettingsStore());
const activeTab = ref<'settings' | 'prompts'>('settings');
const injecting = ref(false);
const clearing = ref(false);
const fetchingModels = ref(false);
const testingConnection = ref(false);
const modelOptions = ref<string[]>([]);
const profileImportInput = ref<HTMLInputElement | null>(null);

const apiProfiles = computed<ApiProfile[]>(() => settings.value.api_profiles as ApiProfile[]);

const activeProfile = computed<ApiProfile | null>(() => {
  const id = settings.value.api_active_profile_id;
  return apiProfiles.value.find(item => item.id === id) ?? null;
});

watch(
  () => [
    settings.value.api_enabled,
    settings.value.api_url,
    settings.value.api_key,
    settings.value.api_model,
    settings.value.api_temperature,
    settings.value.api_max_tokens,
  ],
  () => {
    syncFieldsToActiveProfile();
  },
);

onMounted(() => {
  ensureProfiles();
  applyProfileToFields(activeProfile.value);
});
</script>
