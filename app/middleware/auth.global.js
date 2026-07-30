export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }

  const userId = user.value?.sub ?? user.value?.id

  if (userId) {
    const authStore = useAuthStore()
    if (!authStore.profile) {
      try {
        await authStore.fetchUserData(userId)
      } catch {
        await supabase.auth.signOut()
        authStore.clear()
        return navigateTo('/login')
      }
    }

    if (to.path !== '/login' && !authStore.isSuperAdmin && !authStore.brandRole) {
      await supabase.auth.signOut()
      authStore.clear()
      return navigateTo('/login')
    }
  }
})
