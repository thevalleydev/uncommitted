<!-- About page: introduces the project journal concept -->
<script setup lang="ts">
usePageSeo({
  title: 'About',
  description: 'Uncommitted is a project journal documenting works in progress. Building in public, finishing optional.',
  path: '/about',
  breadcrumbs: useBreadcrumbs('about'),
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-14 sm:pt-12 sm:pb-16">
    <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
      About
    </h1>

    <div class="prose prose-zinc dark:prose-invert prose-lg max-w-none">
      <p>
        Uncommitted is a project journal. Part accountability system, part public notebook,
        part excuse to document things that might never ship.
      </p>

      <p>
        The name is a double meaning: like an uncommitted git change that exists somewhere
        between idea and implementation, and like the dozens of projects that get started
        but never quite finished.
      </p>

      <p>
        This is a space to work through ideas in public. Some will become real things.
        Most won't. That's fine.
      </p>

      <h2>What you'll find here</h2>

      <ul>
        <li>Project logs and progress updates</li>
        <li>Technical notes and fragments</li>
        <li>Ideas in various states of completion</li>
        <li>Lessons from things that didn't work out</li>
      </ul>

      <h2>The format</h2>

      <p>
        Posts are rough, informal, and honest. No polished thought-leadership here.
        Just the messy reality of building things.
      </p>

      <h2>Get in touch</h2>

      <p>
        Have a question or suggestion? Open an
        <a href="https://github.com/thevalleydev/the-signal/issues/new">
          issue
        </a>
        on GitHub.
      </p>
    </div>
  </div>
</template>
