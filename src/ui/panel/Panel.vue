<template>
  <section class="meowdb-visual-shell">
    <header class="meowdb-visual-header">
      <div class="meowdb-title-group">
        <h3>MeowDB 喵喵表格</h3>
        <span class="meowdb-version">Live</span>
      </div>
      <div class="meowdb-header-actions">
        <button class="menu_button meowdb-refresh" :disabled="updating" @click="refresh">刷新</button>
        <button class="menu_button meowdb-refresh" :disabled="updating" @click="manualUpdate">
          {{ updating ? '更新中...' : 'AI更新' }}
        </button>
      </div>
    </header>

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
      <button class="meowdb-tab" disabled>设置</button>
    </nav>

    <Transition name="meowdb-fade" mode="out-in">
      <div v-if="activeTab === 'status'" key="status" class="meowdb-tab-panel">
        <div class="meowdb-card-grid">
          <article class="meowdb-card">
            <h4>当前时间</h4>
            <p>{{ entry?.time || '未设置' }}</p>
          </article>
          <article class="meowdb-card">
            <h4>当前地点</h4>
            <p>{{ sceneText }}</p>
          </article>
          <article class="meowdb-card">
            <h4>剧情摘要</h4>
            <p>{{ entry?.plot || '暂无摘要' }}</p>
          </article>
          <article class="meowdb-card">
            <h4>NSFW 进度</h4>
            <p>{{ nsfwText }}</p>
          </article>
        </div>
      </div>

      <div v-else key="relations" class="meowdb-tab-panel meowdb-rel-wrap">
        <section class="meowdb-rel-network">
          <div class="meowdb-rel-network-title">关系网</div>
          <div class="meowdb-rel-network-core">
            <div class="meowdb-rel-node is-core">
              <div class="meowdb-rel-node-name">{{ coreRelation?.name || '[user]' }}</div>
              <div class="meowdb-rel-node-meta">核心视角</div>
            </div>
            <div class="meowdb-rel-links">
              <button
                v-for="person in otherRelations"
                :key="person.name"
                class="meowdb-rel-link-item"
                type="button"
                @click="openRelationDetail(person)"
              >
                <span class="meowdb-rel-link-name">{{ person.name }}</span>
                <span class="meowdb-rel-link-bond">{{ person.bond || '未定义羁绊' }}</span>
                <span class="meowdb-rel-link-favor">好感 {{ formatFavor(person.favor) }}</span>
              </button>
            </div>
          </div>
        </section>

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
            <div class="meowdb-rel-line">👗 {{ relation.clothing || '服饰未记录' }}</div>
            <footer class="meowdb-rel-card-foot">
              <span>{{ relation.bond || '羁绊未定义' }}</span>
              <strong>{{ formatFavor(relation.favor) }}</strong>
            </footer>
          </article>
        </section>
      </div>
    </Transition>

    <Transition name="meowdb-slide">
      <aside v-if="selectedRelation" class="meowdb-rel-detail-mask" @click.self="selectedRelation = null">
        <article class="meowdb-rel-detail">
          <button class="meowdb-rel-detail-close" type="button" @click="selectedRelation = null">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <h3>{{ selectedRelation.name }}</h3>
          <div class="meowdb-rel-detail-grid">
            <div>
              <b>性别</b>
              <p>{{ selectedRelation.gender || '未知' }}</p>
            </div>
            <div>
              <b>性器官及状态</b>
              <p>{{ selectedRelation.genitalStatus || '未记录' }}</p>
            </div>
            <div>
              <b>身份</b>
              <p>{{ selectedRelation.identity || '未记录' }}</p>
            </div>
            <div>
              <b>核心人格</b>
              <p>{{ selectedRelation.personality || '未记录' }}</p>
            </div>
            <div>
              <b>性经验</b>
              <p>{{ selectedRelation.sexExp || '未记录' }}</p>
            </div>
            <div>
              <b>当前位置</b>
              <p>{{ selectedRelation.coordinate || '未记录' }}</p>
            </div>
            <div>
              <b>实时动作</b>
              <p>{{ selectedRelation.action || '未记录' }}</p>
            </div>
            <div>
              <b>全套服饰</b>
              <p>{{ selectedRelation.clothing || '未记录' }}</p>
            </div>
            <div>
              <b>当前羁绊</b>
              <p>{{ selectedRelation.bond || '未记录' }}</p>
            </div>
            <div>
              <b>好感值</b>
              <p>{{ formatFavor(selectedRelation.favor) }}</p>
            </div>
            <div class="is-full">
              <b>增幅原因</b>
              <p>{{ selectedRelation.favorChange || '无' }}</p>
            </div>
          </div>
        </article>
      </aside>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { runManualAiUpdate } from '@/modules/ai-updater';
import { getCurrentEntry } from '@/modules/data-manager';
import type { CharacterRelation } from '@/type/meowdb';

const activeTab = ref<'status' | 'relations'>('status');
const entry = ref(getCurrentEntry());
const updating = ref(false);
const selectedRelation = ref<CharacterRelation | null>(null);

const relations = computed(() => entry.value?.relations ?? []);

const coreRelation = computed(() => {
  const list = relations.value;
  if (!list.length) return null;

  return (
    list.find(item => /<user>|\buser\b/i.test(item.name || '')) ??
    list.find(item => /raven/i.test(item.name || '')) ??
    list[0]
  );
});

const otherRelations = computed(() => {
  const core = coreRelation.value;
  if (!core) return relations.value;
  return relations.value.filter(item => item.name !== core.name);
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

function formatFavor(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.0';
  const fixed = value.toFixed(1);
  return value > 0 ? `+${fixed}` : fixed;
}

function refresh() {
  entry.value = getCurrentEntry();
}

function openRelationDetail(relation: CharacterRelation) {
  selectedRelation.value = relation;
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
</script>
