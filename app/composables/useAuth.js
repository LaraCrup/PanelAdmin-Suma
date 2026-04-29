export function useAuth() {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const authStore = useAuthStore()

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }
    await authStore.fetchUserData(data.user.id)

    if (!authStore.isSuperAdmin && !authStore.brandRole) {
      await supabase.auth.signOut()
      authStore.clear()
      return { error: { message: 'No tenés acceso al panel de administración.' } }
    }

    await navigateTo('/')
    return { error: null }
  }

  async function logout() {
    await supabase.auth.signOut()
    authStore.clear()
    await navigateTo('/login')
  }

  async function initAuth() {
    if (authStore.profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      await authStore.fetchUserData(user.id)
    }
  }

  return {
    login,
    logout,
    initAuth,
    isSuperAdmin: computed(() => authStore.isSuperAdmin),
    isBrandAdmin: computed(() => authStore.isBrandAdmin),
    isBrandMember: computed(() => authStore.isBrandMember),
    brandId: computed(() => authStore.brandId),
    profile: computed(() => authStore.profile),
    brand: computed(() => authStore.brand),
  }
}
