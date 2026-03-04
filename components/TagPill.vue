<!-- Clickable tag pill that links to filtered blog listing -->
<script setup lang="ts">
interface Props {
  tag: string
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: true,
})
</script>

<template>
  <NuxtLink
    v-if="clickable"
    :to="`/blog/tag/${tag}`"
    class="inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[0.6875rem] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-signal-100 hover:text-signal-800 dark:hover:bg-signal-900/40 dark:hover:text-signal-300 transition-colors"
  >
    {{ tag }}
  </NuxtLink>
  <span
    v-else
    class="inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[0.6875rem] font-medium text-zinc-600 dark:text-zinc-300"
  >
    {{ tag }}
  </span>
</template>
