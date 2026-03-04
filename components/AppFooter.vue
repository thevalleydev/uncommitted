<!-- Site footer -->
<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-zinc-200/60 dark:border-zinc-800/50 py-8 mt-auto" role="contentinfo">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 flex flex-col items-center gap-4 text-sm text-zinc-500 dark:text-zinc-300 sm:flex-row sm:justify-between">
      <p>&copy; {{ currentYear }} Uncommitted.</p>

      <nav class="flex gap-6" aria-label="Footer navigation">
        <NuxtLink to="/blog" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          Blog
        </NuxtLink>
        <NuxtLink to="/about" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          About
        </NuxtLink>
        <a
          href="https://github.com/thevalleydev/the-signal"
          class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          aria-label="View source on GitHub"
        >
          GitHub
        </a>
      </nav>
    </div>
  </footer>
</template>
