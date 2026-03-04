<!-- Homepage: hero + recent articles -->
<script setup lang="ts">
const { data: articles } = await useAsyncData('recent-articles', () =>
  queryContent('blog')
    .sort({ date: -1 })
    .limit(6)
    .find(),
)

usePageSeo({
  title: 'Uncommitted - Works in Progress',
  description: 'Project logs, fragments, and ideas that may or may not ship. Building in public, finishing optional.',
  path: '/',
  breadcrumbs: useBreadcrumbs('home'),
})

useSchemaOrg([
  defineWebSite({
    name: 'Uncommitted',
    description: 'Project logs, fragments, and ideas that may or may not ship.',
  }),
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="mx-auto max-w-3xl px-4 sm:px-6 pt-14 pb-12 sm:pt-16 sm:pb-14 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        Uncommitted
      </h1>
      <p class="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
        Project logs, fragments, and ideas that may or may not ship.
        Building in public, finishing optional.
      </p>
      <div class="mt-8">
        <NuxtLink
          to="/blog"
          class="inline-flex items-center rounded-full bg-signal-600 px-7 py-3 text-sm font-medium text-white shadow-lg shadow-signal-600/20 hover:bg-signal-700 hover:shadow-signal-700/25 dark:shadow-signal-500/10 transition-all"
        >
          Read the blog
        </NuxtLink>
      </div>
    </section>

    <!-- Recent articles -->
    <section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 pb-14 sm:pb-16">
      <div class="border-t border-zinc-200/60 dark:border-zinc-800/60 mb-8" />
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Recent writing
        </h2>
        <NuxtLink to="/blog" class="text-sm text-signal-600 dark:text-signal-400 hover:underline">
          View all &rarr;
        </NuxtLink>
      </div>

      <div v-if="articles?.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard
          v-for="article in articles"
          :key="article._path"
          :title="article.title ?? ''"
          :description="article.description ?? ''"
          :date="article.date ?? ''"
          :slug="article._path?.replace('/blog/', '') ?? ''"
          :tags="article.tags"
          :reading-time="article.readingTime"
        />
      </div>

      <div v-else class="glass rounded-2xl border-dashed p-12 text-center">
        <p class="text-zinc-500 dark:text-zinc-300">No articles yet. They're on the way.</p>
      </div>
    </section>
  </div>
</template>
