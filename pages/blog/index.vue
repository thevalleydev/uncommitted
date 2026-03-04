<!-- Blog listing page: all articles sorted by date -->
<script setup lang="ts">
const { data: articles } = await useAsyncData('all-articles', () =>
  queryContent('blog')
    .sort({ date: -1 })
    .find(),
)

usePageSeo({
  title: 'Blog',
  description: 'All posts from Uncommitted. Project logs, notes, and ideas in various states of completion.',
  path: '/blog',
  breadcrumbs: useBreadcrumbs('blog'),
  collection: articles.value?.map((a) => ({
    name: a.title ?? '',
    url: a._path ?? '',
    description: a.description,
  })),
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 pt-10 pb-14 sm:pt-12 sm:pb-16">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Blog
      </h1>
      <p class="mt-2 text-zinc-600 dark:text-zinc-300">
        Every article, newest first.
      </p>
    </header>

    <h2 class="sr-only">Articles</h2>

    <div v-if="articles?.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <p class="text-zinc-500 dark:text-zinc-300">Nothing published yet. Check back soon.</p>
    </div>
  </div>
</template>
