<!-- Table of contents for articles -->
<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

defineProps<{
  links: TocLink[]
}>()
</script>

<template>
  <nav v-if="links?.length" class="glass-subtle rounded-xl p-4" aria-label="Table of contents">
    <h2 class="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      Contents
    </h2>
    <ul class="space-y-1.5">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="text-sm text-zinc-600 dark:text-zinc-300 hover:text-signal-600 dark:hover:text-signal-400 transition-colors"
        >
          {{ link.text }}
        </a>
        <ul v-if="link.children?.length" class="ml-4 mt-1 space-y-1">
          <li v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="text-xs text-zinc-500 dark:text-zinc-400 hover:text-signal-600 dark:hover:text-signal-400 transition-colors"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
