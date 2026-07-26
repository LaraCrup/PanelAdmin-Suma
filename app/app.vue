<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

useHead({
  title: () => route.meta.title,
  titleTemplate: title => (title ? `${title} | Suma Admin` : 'Suma Admin'),
})
</script>
