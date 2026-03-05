<script setup lang="ts">
/**
 * ProseImg - NuxtImg wrapper for Markdown content images
 * Provides lazy loading, webp conversion, and optional figcaption from alt text
 */
interface Props {
  src: string
  alt?: string
  width?: number
  height?: number
}

defineProps<Props>()
</script>

<template>
  <figure class="my-6">
    <NuxtImg
      :src="src"
      :alt="alt || ''"
      :width="width"
      :height="height"
      class="rounded-lg border border-zinc-200 dark:border-zinc-800"
      loading="lazy"
      format="webp"
      quality="80"
    />
    <figcaption
      v-if="alt"
      class="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400"
    >
      {{ alt }}
    </figcaption>
  </figure>
</template>
