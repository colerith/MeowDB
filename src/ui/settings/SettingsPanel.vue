<template>
  <div class="meowdb-drawer-body">
    <div class="drawer-header">
      <div class="meowdb-title">
        <i class="fa-solid fa-paw"></i>
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
              <button class="menu_button meowdb-tool-btn" type="button" @click="openProfileEditor('create')">
                新建方案
              </button>
              <button class="menu_button meowdb-tool-btn" type="button" @click="openProfileEditor('rename')">
                重命名
              </button>
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

            <Transition name="meowdb-fade">
              <div v-if="profileEditorOpen" class="meowdb-profile-editor" @keydown.enter.prevent="submitProfileEditor">
                <label class="meowdb-setting-stack">
                  <span>{{ profileEditorMode === 'create' ? '输入新方案名称' : '输入新名称' }}</span>
                  <input
                    ref="profileEditorInput"
                    class="meowdb-input"
                    v-model.trim="profileEditorName"
                    type="text"
                    placeholder="e.g. OpenRouter-cheap"
                  />
                </label>
                <div class="meowdb-profile-editor-actions">
                  <button class="menu_button meowdb-tool-btn" type="button" @click="submitProfileEditor">确认</button>
                  <button class="menu_button meowdb-tool-btn" type="button" @click="closeProfileEditor">取消</button>
                </div>
              </div>
            </Transition>

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
                <h4>关系 更新提示词</h4>
                <p>用于 AI 更新角色关系、服饰/外貌拆解和手动字段保护逻辑。</p>
              </div>
              <button class="menu_button meowdb-tool-btn" type="button" @click="restoreRelationsPrompt">
                恢复默认
              </button>
            </header>

            <textarea
              class="meowdb-input meowdb-prompt-textarea"
              v-model="settings.relations_prompt"
              rows="10"
              placeholder="留空将使用默认 relations 提示词"
            />

            <div class="meowdb-prompt-meta">
              <span>字符数：{{ settings.relations_prompt?.length || 0 }}</span>
              <span>留空 = 使用内置默认</span>
            </div>
          </section>

          <section class="meowdb-prompt-card">
            <header class="meowdb-prompt-card-head">
              <div>
                <h4>事件 更新提示词</h4>
                <p>用于维护事件时间轴、消息序号映射、事件标签与置顶事件策略。</p>
              </div>
              <button class="menu_button meowdb-tool-btn" type="button" @click="restoreEventsPrompt">恢复默认</button>
            </header>

            <textarea
              class="meowdb-input meowdb-prompt-textarea"
              v-model="settings.events_prompt"
              rows="8"
              placeholder="留空将使用默认事件提示词"
            />

            <div class="meowdb-prompt-meta">
              <span>字符数：{{ settings.events_prompt?.length || 0 }}</span>
              <span>留空 = 使用内置默认</span>
            </div>
          </section>
          <section class="meowdb-prompt-card">
            <header class="meowdb-prompt-card-head">
              <div>
                <h4>承诺 更新提示词</h4>
                <p>用于维护承诺池与待办池（根据状态处理、实现与清理）。</p>
              </div>
              <button class="menu_button meowdb-tool-btn" type="button" @click="restoreEchoesPrompt">恢复默认</button>
            </header>

            <textarea
              class="meowdb-input meowdb-prompt-textarea"
              v-model="settings.echoes_prompt"
              rows="8"
              placeholder="留空将使用默认承诺提示词"
            />

            <div class="meowdb-prompt-meta">
              <span>字符数：{{ settings.echoes_prompt?.length || 0 }}</span>
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
import {
  DEFAULT_ECHOES_PROMPT,
  DEFAULT_EVENTS_PROMPT,
  DEFAULT_RELATIONS_PROMPT,
} from '@/modules/ai-updater/prompt-builder';
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
const profileEditorInput = ref<HTMLInputElement | null>(null);
const profileEditorOpen = ref(false);
const profileEditorMode = ref<'create' | 'rename'>('create');
const profileEditorName = ref('');

const apiProfiles = computed<ApiProfile[]>(() => settings.value.api_profiles as ApiProfile[]);
const activeProfile = computed<ApiProfile | null>(() => {
  const id = settings.value.api_active_profile_id;
  return apiProfiles.value.find(item => item.id === id) ?? null;
});

function makeProfileId() {
  return `api_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createProfile(name?: string): ApiProfile {
  return {
    id: makeProfileId(),
    name: name?.trim() || `配置 ${apiProfiles.value.length + 1}`,
    enabled: Boolean(settings.value.api_enabled),
    url: settings.value.api_url || '',
    key: settings.value.api_key || '',
    model: settings.value.api_model || '',
    temperature: Number(settings.value.api_temperature || 0.7),
    max_tokens: Number(settings.value.api_max_tokens || 1200),
  };
}

function ensureProfiles() {
  if (!Array.isArray(settings.value.api_profiles)) settings.value.api_profiles = [];
  if (settings.value.api_profiles.length === 0) settings.value.api_profiles.push(createProfile('默认配置'));

  const exists = settings.value.api_profiles.some(item => item.id === settings.value.api_active_profile_id);
  if (!exists) settings.value.api_active_profile_id = settings.value.api_profiles[0]?.id || '';
}

function applyProfileToFields(profile: ApiProfile | null) {
  if (!profile) return;
  settings.value.api_enabled = profile.enabled;
  settings.value.api_url = profile.url;
  settings.value.api_key = profile.key;
  settings.value.api_model = profile.model;
  settings.value.api_temperature = profile.temperature;
  settings.value.api_max_tokens = profile.max_tokens;
}

function syncFieldsToActiveProfile() {
  if (!activeProfile.value) return;
  activeProfile.value.enabled = Boolean(settings.value.api_enabled);
  activeProfile.value.url = settings.value.api_url || '';
  activeProfile.value.key = settings.value.api_key || '';
  activeProfile.value.model = settings.value.api_model || '';
  activeProfile.value.temperature = Number(settings.value.api_temperature || 0.7);
  activeProfile.value.max_tokens = Number(settings.value.api_max_tokens || 1200);
}

function saveAsNewProfile(name: string) {
  const profile = createProfile(name);
  settings.value.api_profiles.push(profile);
  settings.value.api_active_profile_id = profile.id;
  toastr.success('已创建新方案');
}

function renameCurrentProfile(name: string) {
  if (!activeProfile.value) return;
  activeProfile.value.name = name.trim() || activeProfile.value.name;
  toastr.success('方案已重命名');
}

function openProfileEditor(mode: 'create' | 'rename') {
  profileEditorMode.value = mode;
  profileEditorName.value = mode === 'rename' ? activeProfile.value?.name || '' : '';
  profileEditorOpen.value = true;
  nextTick(() => profileEditorInput.value?.focus());
}

function closeProfileEditor() {
  profileEditorOpen.value = false;
  profileEditorName.value = '';
}

function submitProfileEditor() {
  const name = profileEditorName.value.trim();
  if (!name) {
    toastr.warning('请输入方案名称');
    return;
  }

  if (profileEditorMode.value === 'create') {
    saveAsNewProfile(name);
  } else {
    renameCurrentProfile(name);
  }

  closeProfileEditor();
}

function updateCurrentProfile() {
  syncFieldsToActiveProfile();
  toastr.success('当前方案已保存');
}

function removeCurrentProfile() {
  if (settings.value.api_profiles.length <= 1) return;
  const id = settings.value.api_active_profile_id;
  settings.value.api_profiles = settings.value.api_profiles.filter(item => item.id !== id);
  settings.value.api_active_profile_id = settings.value.api_profiles[0]?.id || '';
  applyProfileToFields(activeProfile.value);
  toastr.success('已删除当前方案');
}

function exportCurrentProfile() {
  if (!activeProfile.value) return;
  const payload = {
    ...activeProfile.value,
    exportedAt: new Date().toISOString(),
    format: 'meowdb-api-profile-v1',
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (activeProfile.value.name || 'api-profile').replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `meowdb-${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toastr.success('已导出当前方案');
}

function triggerImportProfile() {
  profileImportInput.value?.click();
}

async function onImportProfileFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text) as Partial<ApiProfile>;

    const profile: ApiProfile = {
      id: makeProfileId(),
      name: (data.name || file.name.replace(/\.json$/i, '') || '导入方案').trim(),
      enabled: Boolean(data.enabled),
      url: String(data.url || ''),
      key: String(data.key || ''),
      model: String(data.model || ''),
      temperature: Number(data.temperature ?? 0.7),
      max_tokens: Number(data.max_tokens ?? 1200),
    };

    if (!Number.isFinite(profile.temperature)) profile.temperature = 0.7;
    if (!Number.isFinite(profile.max_tokens) || profile.max_tokens <= 0) profile.max_tokens = 1200;

    settings.value.api_profiles.push(profile);
    settings.value.api_active_profile_id = profile.id;
    applyProfileToFields(profile);
    toastr.success('方案导入成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    toastr.error(`导入失败：${message}`);
  } finally {
    input.value = '';
  }
}

function normalizeUrl(url: string) {
  return url.trim().replace(/\/$/, '');
}

async function fetchModels() {
  const url = normalizeUrl(settings.value.api_url);
  if (!url) {
    toastr.warning('请先填写 API URL');
    return;
  }

  fetchingModels.value = true;
  try {
    const response = await fetch(`${url}/models`, {
      headers: {
        ...(settings.value.api_key ? { Authorization: `Bearer ${settings.value.api_key}` } : {}),
      },
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(reason || `HTTP ${response.status}`);
    }

    const data = (await response.json()) as { data?: Array<{ id?: string }> };
    const ids = (data.data ?? []).map(item => item.id).filter((item): item is string => Boolean(item));

    if (ids.length === 0) {
      toastr.warning('未拉取到模型列表');
      return;
    }

    modelOptions.value = ids;
    if (!settings.value.api_model) settings.value.api_model = ids[0];
    syncFieldsToActiveProfile();
    toastr.success(`已拉取 ${ids.length} 个模型`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    toastr.error(`拉取模型失败：${message}`);
  } finally {
    fetchingModels.value = false;
  }
}

async function testConnection() {
  const url = normalizeUrl(settings.value.api_url);
  if (!url) {
    toastr.warning('请先填写 API URL');
    return;
  }

  testingConnection.value = true;
  try {
    const response = await fetch(`${url}/models`, {
      headers: {
        ...(settings.value.api_key ? { Authorization: `Bearer ${settings.value.api_key}` } : {}),
      },
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(reason || `HTTP ${response.status}`);
    }

    toastr.success('连接测试成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    toastr.error(`连接测试失败：${message}`);
  } finally {
    testingConnection.value = false;
  }
}

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

function restoreEventsPrompt() {
  settings.value.events_prompt = DEFAULT_EVENTS_PROMPT;
  toastr.success('已还原默认事件提示词');
}

function restoreEchoesPrompt() {
  settings.value.echoes_prompt = DEFAULT_ECHOES_PROMPT;
  toastr.success('已还原默认 echoes 提示词');
}

watch(
  () => settings.value.api_active_profile_id,
  () => {
    ensureProfiles();
    applyProfileToFields(activeProfile.value);
  },
  { immediate: true },
);

watch(
  () => [
    settings.value.api_enabled,
    settings.value.api_url,
    settings.value.api_key,
    settings.value.api_model,
    settings.value.api_temperature,
    settings.value.api_max_tokens,
  ],
  () => syncFieldsToActiveProfile(),
);

onMounted(() => {
  ensureProfiles();
  applyProfileToFields(activeProfile.value);

  if (!settings.value.relations_prompt?.trim()) settings.value.relations_prompt = DEFAULT_RELATIONS_PROMPT;
  if (!settings.value.events_prompt?.trim()) settings.value.events_prompt = DEFAULT_EVENTS_PROMPT;
  if (!settings.value.echoes_prompt?.trim()) settings.value.echoes_prompt = DEFAULT_ECHOES_PROMPT;
});
</script>
