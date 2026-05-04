export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (user && to.path === '/login') {
    return navigateTo('/')
  }

  if (user?.id) {
    const authStore = useAuthStore()
    if (!authStore.profile) {
      try {
        await authStore.fetchUserData(user.id)
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
