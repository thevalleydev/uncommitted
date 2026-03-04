<!-- Blog listing filtered by tag -->
<script setup lang="ts">
const route = useRoute()
const tag = computed(() => route.params.tag as string)

const { data: articles } = await useAsyncData(`articles-tag-${tag.value}`, () =>
  queryContent('blog')
    .where({ tags: { $contains: tag.value } })
    .sort({ date: -1 })
    .find(),
)

usePageSeo({
  title: `Articles tagged "${tag.value}"`,
  description: `All posts tagged with "${tag.value}" from Uncommitted.`,
  path: `/blog/tag/${tag.value}`,
  breadcrumbs: [
    ...useBreadcrumbs('blog'),
    { name: `Tag: ${tag.value}` },
  ],
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
      <NuxtLink to="/blog" class="text-sm text-signal-600 dark:text-signal-400 hover:underline mb-4 inline-block">
        &larr; All articles
      </NuxtLink>
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Tagged: <span class="text-signal-600 dark:text-signal-400">{{ tag }}</span>
      </h1>
      <p class="mt-2 text-zinc-600 dark:text-zinc-300">
        {{ articles?.length ?? 0 }} article{{ articles?.length === 1 ? '' : 's' }} with this tag.
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
      <p class="text-zinc-500 dark:text-zinc-300">No articles with this tag yet.</p>
      <NuxtLink to="/blog" class="mt-4 inline-block text-signal-600 dark:text-signal-400 hover:underline">
        View all articles
      </NuxtLink>
    </div>
  </div>
</template>
