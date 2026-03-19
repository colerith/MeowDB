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
      <button class="meowdb-tab is-active">状态</button>
      <button class="meowdb-tab">时间线</button>
      <button class="meowdb-tab">角色</button>
      <button class="meowdb-tab">物品</button>
      <button class="meowdb-tab">场景</button>
      <button class="meowdb-tab">设置</button>
    </nav>

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
  </section>
</template>

<script setup lang="ts">
import { runManualAiUpdate } from '@/modules/ai-updater';
import { getCurrentEntry } from '@/modules/data-manager';

const entry = ref(getCurrentEntry());
const updating = ref(false);

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

function refresh() {
  entry.value = getCurrentEntry();
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
