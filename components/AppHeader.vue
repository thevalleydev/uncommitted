<!-- Site header with navigation -->
<script setup lang="ts">
const route = useRoute()

const navLinks = [
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
]

function isActive(to: string): boolean {
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/50" role="banner">
    <nav class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-14" aria-label="Primary navigation">
      <NuxtLink to="/" class="group flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-indigo-500 dark:border-indigo-400 bg-indigo-950/50 text-indigo-300 font-bold text-sm"
        >
          U
        </span>
        <span class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          Uncommitted
        </span>
      </NuxtLink>

      <div class="flex items-center gap-6">
        <ul class="flex items-center gap-6">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="text-sm font-medium transition-colors"
              :class="isActive(link.to)
                ? 'text-signal-600 dark:text-signal-400'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <ColorModeToggle />
      </div>
    </nav>
  </header>
</template>
