<!-- Default layout: header, main content area, footer -->
<template>
  <div class="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
    <AppHeader />

    <main id="main-content" class="flex-1" role="main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
