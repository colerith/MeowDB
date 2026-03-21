<template>
  <div class="meowdb-empty-state" :class="extraClass">
    <div class="meowdb-empty-illu" aria-hidden="true">
      <span class="meowdb-empty-dot is-a"></span>
      <span class="meowdb-empty-dot is-b"></span>
      <span class="meowdb-empty-dot is-c"></span>
    </div>
    <h4>{{ title }}</h4>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    extraClass?: string;
  }>(),
  {
    extraClass: '',
  },
);
</script>
