const AUTH_ERROR_MAP = {
  'Invalid login credentials':                'Credenciales inválidas. Verificá tu email y contraseña.',
  'Email not confirmed':                      'Tu email no está confirmado. Revisá tu bandeja de entrada.',
  'Too many requests':                        'Demasiados intentos. Esperá unos minutos antes de volver a intentar.',
  'User not found':                           'No existe una cuenta con ese email.',
  'Invalid email or password':                'Email o contraseña incorrectos.',
  'Email rate limit exceeded':                'Demasiados intentos. Esperá unos minutos antes de volver a intentar.',
}

function translateAuthError(error) {
  const msg = AUTH_ERROR_MAP[error.message] ?? 'Ocurrió un error al iniciar sesión. Intentá de nuevo.'
  return { message: msg }
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const authStore = useAuthStore()

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        try {
          const { exists } = await $fetch('/api/check-email', { method: 'POST', body: { email } })
          return {
            error: {
              message: exists
                ? 'Contraseña incorrecta.'
                : 'No existe una cuenta con ese email.',
            },
          }
        } catch {
          // Si el check falla, usar mensaje genérico
        }
      }
      return { error: translateAuthError(error) }
    }
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
