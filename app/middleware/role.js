export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const required = to.meta.requiredRole

  if (!required) return

  if (required === 'superadmin' && !authStore.isSuperAdmin) {
    return navigateTo('/news')
  }
  if (required === 'brand' && authStore.isSuperAdmin) {
    return navigateTo('/admin/news/pendientes')
  }
})
