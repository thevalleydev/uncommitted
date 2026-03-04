<!-- App shell: provides NuxtLayout and NuxtPage rendering -->
<script setup lang="ts">
const { init } = useColorMode()

onMounted(() => {
  init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
