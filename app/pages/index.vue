<template>
  <div class="flex items-center justify-center h-full">
    <LoadingSpinner size="lg" class="text-primary" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', title: 'Inicio' })

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isSuperAdmin) {
    navigateTo('/admin/news/pendientes')
  } else if (authStore.brandId) {
    navigateTo('/news')
  }
})
</script>
