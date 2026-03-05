<!-- Single article page: renders Nuxt Content markdown -->
<script setup lang="ts">
const route = useRoute()

const { data: article } = await useAsyncData(`blog-${route.path}`, () =>
  queryContent(route.path).findOne(),
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

const formattedDate = computed(() => {
  if (!article.value?.date) return ''
  const [year, month, day] = article.value.date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
})

usePageSeo({
  title: article.value.title ?? 'Article',
  description: article.value.description ?? '',
  path: route.path,
  ogType: 'article',
  breadcrumbs: [
    ...useBreadcrumbs('blog'),
    { name: article.value.title ?? 'Article' },
  ],
  article: {
    publishedTime: article.value.date,
    modifiedTime: article.value.updated || article.value.date,
    author: 'Sage Harper',
    cover: article.value.cover,
    section: article.value.tags?.[0] || 'General',
    tags: article.value.tags,
  },
  howTo: article.value.howTo,
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: `https://thevalleydev.github.io/uncommitted${route.path}`,
    },
  ],
})
</script>

<template>
  <article v-if="article" class="pt-8 pb-14 sm:pt-10 sm:pb-16">
    <!-- Article header -->
    <header class="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
      <div class="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-300 mb-4">
        <NuxtLink to="/blog" class="hover:text-signal-600 dark:hover:text-signal-400 transition-colors">
          &larr; Blog
        </NuxtLink>
        <span>&middot;</span>
        <time :datetime="article.date">{{ formattedDate }}</time>
        <span v-if="article.readingTime">&middot; {{ article.readingTime }}</span>
      </div>

      <h1 class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl leading-tight">
        {{ article.title }}
      </h1>

      <p v-if="article.description" class="mt-4 text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {{ article.description }}
      </p>

      <div v-if="article.tags?.length" class="mt-6 flex flex-wrap gap-2">
        <TagPill v-for="tag in article.tags" :key="tag" :tag="tag" />
      </div>
    </header>

    <!-- Table of contents -->
    <aside v-if="article.body?.toc?.links?.length" class="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
      <TableOfContents :links="article.body.toc.links" />
    </aside>

    <!-- Article body -->
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <ContentRenderer :value="article" class="prose prose-zinc dark:prose-invert prose-lg max-w-none" />
    </div>

    <!-- Author footer -->
    <footer class="mx-auto max-w-3xl px-4 sm:px-6 mt-10">
      <div class="glass rounded-2xl p-6">
      <div class="flex items-center gap-4">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-signal-100 dark:bg-signal-900/40 text-signal-700 dark:text-signal-400 font-bold text-lg"
        >
          SH
        </div>
        <div>
          <p class="font-semibold text-zinc-900 dark:text-zinc-50">Sage Harper</p>
          <p class="text-sm text-zinc-600 dark:text-zinc-300">Writer at The Signal</p>
        </div>
      </div>
      </div>
    </footer>
  </article>
</template>
