<!-- Blog post card for listing pages -->
<script setup lang="ts">
interface Props {
  title: string
  description: string
  date: string
  slug: string
  tags?: string[]
  readingTime?: string
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  const [year, month, day] = props.date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
})
</script>

<template>
  <article class="group">
    <NuxtLink :to="`/blog/${slug}`" class="block">
      <div class="glass rounded-2xl p-5 sm:p-6 card-hover h-full flex flex-col">
        <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          <time :datetime="date">{{ formattedDate }}</time>
          <template v-if="readingTime">
            <span class="text-zinc-400 dark:text-zinc-500" aria-hidden="true">&middot;</span>
            <span>{{ readingTime }}</span>
          </template>
        </div>

        <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-signal-600 dark:group-hover:text-signal-400 transition-colors leading-snug">
          {{ title }}
        </h3>

        <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-300 leading-relaxed line-clamp-2 flex-1">
          {{ description }}
        </p>

        <div v-if="tags?.length" class="mt-4 flex flex-wrap gap-1.5">
          <TagPill v-for="tag in tags" :key="tag" :tag="tag" />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
