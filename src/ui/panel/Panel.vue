<template>
  <section class="meowdb-visual-shell" :class="{ 'is-collapsed': panelCollapsed }">
    <header class="meowdb-visual-header">
      <div
        class="meowdb-title-group meowdb-title-toggle"
        role="button"
        tabindex="0"
        @click="toggleCollapse"
        @keydown.enter.prevent="toggleCollapse"
        @keydown.space.prevent="toggleCollapse"
      >
        <h3>MeowDB 喵喵表格</h3>
        <span class="meowdb-serial-badge">{{ entry?.serial || '未编号' }}</span>
      </div>
      <div class="meowdb-header-actions">
        <button class="menu_button meowdb-action-btn" :disabled="updating" @click="refresh">
          <i class="fa-solid fa-rotate"></i>
          <span>刷新</span>
        </button>
        <button class="menu_button meowdb-action-btn meowdb-action-btn-ai" :disabled="updating" @click="manualUpdate">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>{{ updating ? '更新中...' : 'AI更新' }}</span>
        </button>
      </div>
    </header>

    <template v-if="!panelCollapsed">
      <nav class="meowdb-tab-row">
        <button class="meowdb-tab" :class="{ 'is-active': activeTab === 'status' }" @click="activeTab = 'status'">
          状态
        </button>
        <button class="meowdb-tab" :class="{ 'is-active': activeTab === 'relations' }" @click="activeTab = 'relations'">
          关系
        </button>
        <button class="meowdb-tab" disabled>时间线</button>
        <button class="meowdb-tab" disabled>物品</button>
        <button class="meowdb-tab" disabled>场景</button>
        <button class="meowdb-tab" :class="{ 'is-active': activeTab === 'settings' }" @click="activeTab = 'settings'">
          设置
        </button>
      </nav>

      <Transition name="meowdb-fade" mode="out-in">
        <div v-if="activeTab === 'status'" key="status" class="meowdb-tab-panel">
          <div class="meowdb-card-grid">
            <article class="meowdb-card">
              <h4><strong>当前时间</strong></h4>
              <p>{{ entry?.time || '未设置' }}</p>
            </article>
            <article class="meowdb-card">
              <h4><strong>当前地点</strong></h4>
              <p>{{ sceneText }}</p>
            </article>
            <article class="meowdb-card">
              <h4><strong>剧情摘要</strong></h4>
              <p>{{ entry?.plot || '暂无摘要' }}</p>
            </article>
            <article class="meowdb-card">
              <h4><strong>NSFW 进度</strong></h4>
              <p>{{ nsfwText }}</p>
            </article>
          </div>
          <div class="meowdb-watermark">MeowDB Story Snapshot</div>
        </div>

        <div v-else-if="activeTab === 'relations'" key="relations" class="meowdb-tab-panel meowdb-rel-wrap">
          <section class="meowdb-rel-cards">
            <article
              v-for="relation in relations"
              :key="relation.name"
              class="meowdb-rel-card"
              @click="openRelationDetail(relation)"
            >
              <header class="meowdb-rel-card-head">
                <div class="meowdb-rel-name">{{ relation.name }}</div>
                <div class="meowdb-rel-gender">{{ relation.gender || '未知' }}</div>
              </header>
              <div class="meowdb-rel-line">⌾ {{ relation.genitalStatus || '未记录' }}</div>
              <div class="meowdb-rel-line">
                🏷️ {{ relation.identity || '身份未知' }} · {{ relation.personality || '人格未知' }}
              </div>
              <div class="meowdb-rel-line">
                📍 {{ relation.coordinate || '位置未知' }} · ⚡ {{ relation.action || '动作未知' }}
              </div>
              <div class="meowdb-rel-line">👗 {{ relation.clothing || summarizeClothing(relation) }}</div>
              <div class="meowdb-rel-line">👤 {{ relation.appearance || summarizeAppearance(relation) }}</div>
              <footer class="meowdb-rel-card-foot">
                <span>{{ relation.bond || '羁绊未定义' }}</span>
                <strong class="meowdb-favor-block">
                  <span>{{ formatOne(getFavorBase(relation)) }}</span>
                  <span :class="deltaClass(getFavorDelta(relation))">{{ formatSigned(getFavorDelta(relation)) }}</span>
                  <span>= {{ formatOne(getFavor(relation)) }}</span>
                </strong>
              </footer>
            </article>
          </section>

          <details class="meowdb-rel-graph-collapse">
            <summary>
              <i class="fa-solid fa-circle-nodes"></i>
              关系图谱（点击展开）
            </summary>
            <div class="meowdb-rel-graph-shell">
              <svg class="meowdb-rel-graph" viewBox="0 0 760 360" role="img" aria-label="关系图谱">
                <g v-for="edge in graphEdges" :key="edge.id" class="meowdb-rel-graph-edge">
                  <line :x1="edge.from.x" :y1="edge.from.y" :x2="edge.to.x" :y2="edge.to.y" />
                  <text :x="edge.labelX" :y="edge.labelY">{{ edge.label }}</text>
                </g>
                <g
                  v-for="node in graphNodes"
                  :key="node.name"
                  class="meowdb-rel-graph-node"
                  @click="openRelationByName(node.name)"
                >
                  <circle :cx="node.x" :cy="node.y" :r="node.isCore ? 11 : 8" :fill="node.color" />
                  <text :x="node.x" :y="node.y + (node.isCore ? 24 : 21)">{{ node.name }}</text>
                </g>
              </svg>
            </div>
          </details>
        </div>

        <div v-else key="settings" class="meowdb-tab-panel">
          <div class="meowdb-palette-card">
            <div class="meowdb-palette-head">
              <b>关系图配色组（1组5色）</b>
              <button class="menu_button meowdb-tool-btn" type="button" @click="resetPalette">恢复默认</button>
            </div>
            <div class="meowdb-palette-grid">
              <label v-for="(_, index) in paletteValues" :key="index" class="meowdb-palette-cell">
                <span>颜色 {{ index + 1 }}</span>
                <input type="color" v-model="paletteValues[index]" @change="applyPaletteColor(index)" />
              </label>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="meowdb-slide">
        <aside v-if="selectedRelation" class="meowdb-rel-detail-mask" @click.self="selectedRelation = null">
          <article
            class="meowdb-rel-detail"
            @keydown.left.prevent="selectPrev"
            @keydown.right.prevent="selectNext"
            tabindex="0"
          >
            <button class="meowdb-rel-detail-close" type="button" @click="selectedRelation = null">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <h3>{{ selectedRelation.name }}</h3>

            <div class="meowdb-rel-detail-nav">
              <button class="menu_button" type="button" :disabled="selectedIndex <= 0" @click="selectPrev">
                上一位
              </button>
              <span>{{ selectedIndex + 1 }} / {{ relations.length }}</span>
              <button
                class="menu_button"
                type="button"
                :disabled="selectedIndex >= relations.length - 1"
                @click="selectNext"
              >
                下一位
              </button>
            </div>

            <div class="meowdb-rel-bulk-actions">
              <button
                class="menu_button"
                type="button"
                :disabled="pendingChanges.length === 0"
                @click="savePendingChanges"
              >
                保存修改（{{ pendingChanges.length }}）
              </button>
              <button
                class="menu_button"
                type="button"
                :disabled="manualFields.length === 0"
                @click="restoreAllManualFields"
              >
                还原手动字段（{{ manualFields.length }}）
              </button>
            </div>

            <section class="meowdb-rel-edit-section">
              <h4>基础信息</h4>
              <div class="meowdb-rel-edit-grid">
                <div
                  v-for="field in coreFields"
                  :key="field.key"
                  class="meowdb-edit-cell"
                  :class="{ 'is-manual': isFieldManual(field.key), 'is-pending': isFieldPending(field.key) }"
                >
                  <label>{{ field.label }}</label>
                  <input class="meowdb-input" :type="field.type || 'text'" v-model="draft[field.key]" />
                </div>
              </div>
            </section>

            <section class="meowdb-rel-edit-section">
              <h4>服饰拆解</h4>
              <div class="meowdb-rel-edit-grid">
                <div
                  v-for="field in clothingFields"
                  :key="field.key"
                  class="meowdb-edit-cell"
                  :class="{ 'is-manual': isFieldManual(field.key), 'is-pending': isFieldPending(field.key) }"
                >
                  <label>{{ field.label }}</label>
                  <input class="meowdb-input" v-model="draft[field.key]" />
                </div>
              </div>
            </section>

            <section class="meowdb-rel-edit-section">
              <h4>外貌拆解</h4>
              <div class="meowdb-rel-edit-grid">
                <div
                  v-for="field in appearanceFields"
                  :key="field.key"
                  class="meowdb-edit-cell"
                  :class="{ 'is-manual': isFieldManual(field.key), 'is-pending': isFieldPending(field.key) }"
                >
                  <label>{{ field.label }}</label>
                  <input class="meowdb-input" v-model="draft[field.key]" />
                </div>
              </div>
            </section>
          </article>
        </aside>
      </Transition>
    </template>
  </section>
</template>

<script setup lang="ts">
import { runManualAiUpdate } from '@/modules/ai-updater';
import { getCurrentEntry, saveCurrentEntry } from '@/modules/data-manager';
import { useSettingsStore } from '@/store/settings';
import type { CharacterRelation } from '@/type/meowdb';
import { storeToRefs } from 'pinia';

type VisualTab = 'status' | 'relations' | 'settings';

interface EditableField {
  key: string;
  label: string;
  type?: 'text' | 'number';
}

const defaultPalette = ['#7dd3fc', '#f9a8d4', '#86efac', '#fcd34d', '#c4b5fd'];

const coreFields: EditableField[] = [
  { key: 'gender', label: '性别' },
  { key: 'birthday', label: '生日' },
  { key: 'genitalStatus', label: '性器官及状态' },
  { key: 'identity', label: '身份' },
  { key: 'personality', label: '核心人格' },
  { key: 'sexExp', label: '性经验' },
  { key: 'coordinate', label: '当前位置' },
  { key: 'action', label: '实时动作' },
  { key: 'bond', label: '当前羁绊' },
  { key: 'favorBase', label: '好感基础值', type: 'number' },
  { key: 'favorDelta', label: '好感增减值', type: 'number' },
  { key: 'favorChange', label: '增减原因' },
  { key: 'clothing', label: '服饰总览' },
  { key: 'appearance', label: '外貌总览' },
];

const clothingFields: EditableField[] = [
  { key: 'clothingParts.headwear', label: '头饰' },
  { key: 'clothingParts.jewelry', label: '首饰' },
  { key: 'clothingParts.facewear', label: '面饰' },
  { key: 'clothingParts.upper', label: '上装' },
  { key: 'clothingParts.lower', label: '下装' },
  { key: 'clothingParts.underwearTop', label: '内衣' },
  { key: 'clothingParts.underwearBottom', label: '内裤' },
  { key: 'clothingParts.shoesSocks', label: '鞋袜' },
];

const appearanceFields: EditableField[] = [
  { key: 'appearanceParts.hairColor', label: '发色' },
  { key: 'appearanceParts.eyeColor', label: '瞳色' },
  { key: 'appearanceParts.height', label: '身高' },
  { key: 'appearanceParts.bodyType', label: '体型' },
];

const { settings } = storeToRefs(useSettingsStore());
const entry = ref(getCurrentEntry());
const updating = ref(false);
const selectedRelation = ref<CharacterRelation | null>(null);
const draft = reactive<Record<string, string>>({});

const activeTab = ref<VisualTab>(normalizeTab(settings.value.visual_active_tab));
const panelCollapsed = ref(Boolean(settings.value.visual_panel_collapsed));
const paletteValues = ref<string[]>([...defaultPalette]);

const relations = computed(() => entry.value?.relations ?? []);

const selectedIndex = computed(() => {
  if (!selectedRelation.value) return -1;
  return relations.value.findIndex(item => item.name === selectedRelation.value?.name);
});

const coreRelation = computed(() => {
  const list = relations.value;
  if (!list.length) return null;
  return list.find(item => /<user>|\buser\b/i.test(item.name || '')) ?? list[0];
});

const graphNodes = computed(() => {
  const list = relations.value;
  if (!list.length) return [] as Array<{ name: string; x: number; y: number; isCore: boolean; color: string }>;

  const core = coreRelation.value ?? list[0];
  const others = list.filter(item => item.name !== core.name);
  const center = { x: 380, y: 170 };

  const nodes = [{ name: core.name, x: center.x, y: center.y, isCore: true, color: '#7ee7cf' }];
  const radiusX = 260;
  const radiusY = 130;

  others.forEach((item, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(others.length, 1) - Math.PI / 2;
    nodes.push({
      name: item.name,
      x: center.x + Math.cos(angle) * radiusX,
      y: center.y + Math.sin(angle) * radiusY,
      isCore: false,
      color: pickColor(item.name),
    });
  });

  return nodes;
});

const graphEdges = computed(() => {
  const nodes = graphNodes.value;
  const coreNode = nodes.find(node => node.isCore);
  if (!coreNode) {
    return [] as Array<{
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
      label: string;
      labelX: number;
      labelY: number;
    }>;
  }

  return nodes
    .filter(node => !node.isCore)
    .map(node => {
      const relation = relations.value.find(item => item.name === node.name);
      const label = relation?.bond || '关联';
      return {
        id: `${coreNode.name}->${node.name}`,
        from: { x: coreNode.x, y: coreNode.y },
        to: { x: node.x, y: node.y },
        label,
        labelX: (coreNode.x + node.x) / 2,
        labelY: (coreNode.y + node.y) / 2,
      };
    });
});

const sceneText = computed(() => {
  const scene = entry.value?.scene;
  if (!scene) return '未设置';
  return `${scene.main} - ${scene.sub}（停留回合：${scene.stayRounds}）`;
});

const nsfwText = computed(() => {
  const nsfw = entry.value?.nsfw;
  if (!nsfw) return '0/0';
  return `${nsfw.current}/${nsfw.max}`;
});

const allFields = computed(() => [...coreFields, ...clothingFields, ...appearanceFields]);

const pendingChanges = computed(() => {
  if (!selectedRelation.value) return [] as string[];

  return allFields.value
    .filter(field => {
      const oldValue = getByPath(selectedRelation.value as Record<string, any>, field.key);
      const draftValue = coerceByType(draft[field.key], field.type);
      return !Object.is(oldValue, draftValue);
    })
    .map(field => field.key);
});

const manualFields = computed(() => {
  if (!selectedRelation.value) return [] as string[];
  return Object.keys(selectedRelation.value.manualEdited ?? {}).filter(
    key => selectedRelation.value?.manualEdited?.[key],
  );
});

watch(activeTab, tab => {
  settings.value.visual_active_tab = tab;
});

watch(panelCollapsed, collapsed => {
  settings.value.visual_panel_collapsed = collapsed;
});

watch(
  () => settings.value.relation_colors,
  next => {
    const list = Array.isArray(next) ? next.slice(0, 5) : [];
    while (list.length < 5) list.push(defaultPalette[list.length]);
    paletteValues.value = list;
  },
  { immediate: true, deep: true },
);

watch(
  selectedRelation,
  relation => {
    Object.keys(draft).forEach(key => delete draft[key]);
    if (!relation) return;

    allFields.value.forEach(field => {
      draft[field.key] = String(getByPath(relation as Record<string, any>, field.key) ?? '');
    });
  },
  { immediate: true },
);

function normalizeTab(tab: string | undefined): VisualTab {
  if (tab === 'relations' || tab === 'settings' || tab === 'status') return tab;
  return 'status';
}

function toggleCollapse() {
  panelCollapsed.value = !panelCollapsed.value;
}

function pickColor(name: string): string {
  const palette = normalizePalette(settings.value.relation_colors);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

function normalizePalette(colors: string[] | undefined): string[] {
  if (!Array.isArray(colors) || colors.length < 5) return defaultPalette;
  return colors
    .slice(0, 5)
    .map((color, idx) => (typeof color === 'string' && color.trim() ? color : defaultPalette[idx]));
}

function applyPaletteColor(index: number) {
  const next = [...paletteValues.value];
  while (next.length < 5) next.push(defaultPalette[next.length]);
  settings.value.relation_colors = next.slice(0, 5);
}

function resetPalette() {
  paletteValues.value = [...defaultPalette];
  settings.value.relation_colors = [...defaultPalette];
}

function formatOne(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.0';
  return value.toFixed(1);
}

function formatSigned(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '+0.0';
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

function deltaClass(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) return 'is-flat';
  return value > 0 ? 'is-up' : 'is-down';
}

function getFavor(relation: CharacterRelation) {
  return typeof relation.favor === 'number' ? relation.favor : getFavorBase(relation) + getFavorDelta(relation);
}

function getFavorBase(relation: CharacterRelation) {
  if (typeof relation.favorBase === 'number') return relation.favorBase;
  if (typeof relation.favor === 'number' && typeof relation.favorDelta === 'number')
    return relation.favor - relation.favorDelta;
  return typeof relation.favor === 'number' ? relation.favor : 0;
}

function getFavorDelta(relation: CharacterRelation) {
  return typeof relation.favorDelta === 'number' ? relation.favorDelta : 0;
}

function summarizeClothing(relation: CharacterRelation) {
  const parts = relation.clothingParts;
  if (!parts) return '服饰未记录';
  return [parts.upper, parts.lower, parts.shoesSocks].filter(Boolean).join(' / ') || '服饰未记录';
}

function summarizeAppearance(relation: CharacterRelation) {
  const parts = relation.appearanceParts;
  if (!parts) return '外貌未记录';
  return [parts.hairColor, parts.eyeColor, parts.height, parts.bodyType].filter(Boolean).join(' / ') || '外貌未记录';
}

function refresh() {
  entry.value = getCurrentEntry();
}

function openRelationDetail(relation: CharacterRelation) {
  selectedRelation.value = relation;
}

function openRelationByName(name: string) {
  const relation = relations.value.find(item => item.name === name);
  if (relation) openRelationDetail(relation);
}

function selectPrev() {
  if (selectedIndex.value <= 0) return;
  selectedRelation.value = relations.value[selectedIndex.value - 1] ?? null;
}

function selectNext() {
  if (selectedIndex.value < 0 || selectedIndex.value >= relations.value.length - 1) return;
  selectedRelation.value = relations.value[selectedIndex.value + 1] ?? null;
}

function isFieldManual(path: string) {
  return Boolean(selectedRelation.value?.manualEdited?.[path]);
}

function isFieldPending(path: string) {
  return pendingChanges.value.includes(path);
}

function coerceByType(value: string, type: EditableField['type']) {
  if (type !== 'number') return value ?? '';
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function savePendingChanges() {
  if (!entry.value || !selectedRelation.value) return;
  const index = selectedIndex.value;
  if (index < 0) return;

  const relation = entry.value.relations[index];
  for (const key of pendingChanges.value) {
    const field = allFields.value.find(item => item.key === key);
    const oldValue = getByPath(relation as Record<string, any>, key);
    const newValue = coerceByType(draft[key], field?.type);

    if (relation.aiBaseline[key] === undefined && (typeof oldValue === 'string' || typeof oldValue === 'number')) {
      relation.aiBaseline[key] = oldValue;
    }

    setByPath(relation as Record<string, any>, key, newValue);
    relation.manualEdited[key] = true;
  }

  normalizeFavorFields(relation);
  await persistEntry(relation.name);
}

async function restoreAllManualFields() {
  if (!entry.value || !selectedRelation.value) return;
  const index = selectedIndex.value;
  if (index < 0) return;

  const relation = entry.value.relations[index];
  for (const key of Object.keys(relation.manualEdited ?? {})) {
    if (!relation.manualEdited[key]) continue;
    const baseline = relation.aiBaseline?.[key];
    if (baseline !== undefined) {
      setByPath(relation as Record<string, any>, key, baseline);
      draft[key] = String(baseline);
    }
    delete relation.manualEdited[key];
    delete relation.aiBaseline[key];
  }

  normalizeFavorFields(relation);
  await persistEntry(relation.name);
}

function normalizeFavorFields(relation: CharacterRelation) {
  const base = Number(relation.favorBase ?? 0);
  const delta = Number(relation.favorDelta ?? 0);
  relation.favorBase = Number.isFinite(base) ? Number(base.toFixed(1)) : 0;
  relation.favorDelta = Number.isFinite(delta) ? Number(delta.toFixed(1)) : 0;
  relation.favor = Number((relation.favorBase + relation.favorDelta).toFixed(1));
}

function getByPath(target: Record<string, any>, path: string) {
  return path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), target);
}

function setByPath(target: Record<string, any>, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop();
  if (!last) return;

  let cursor: Record<string, any> = target;
  for (const key of keys) {
    if (cursor[key] == null || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[last] = value;
}

async function persistEntry(activeName?: string) {
  if (!entry.value) return;
  const ok = await saveCurrentEntry(entry.value);
  if (!ok) {
    toastr.error('保存失败，字段值不合法');
    return;
  }

  refresh();
  if (activeName) {
    selectedRelation.value = relations.value.find(item => item.name === activeName) ?? null;
  }
}

async function manualUpdate() {
  if (updating.value) return;
  updating.value = true;

  const result = await runManualAiUpdate();
  updating.value = false;

  if (!result.ok) {
    toastr.error(result.error || 'AI 更新失败');
    return;
  }

  refresh();
  toastr.success('AI 更新完成');
}

function onDataUpdated() {
  refresh();
}

onMounted(() => {
  window.addEventListener('meowdb:data-updated', onDataUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener('meowdb:data-updated', onDataUpdated);
});
</script>
