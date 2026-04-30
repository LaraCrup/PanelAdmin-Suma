export function useBrandUsers() {
  const supabase = useSupabaseClient()
  const brandUsers = ref([])
  const loading = ref(false)

  async function fetchBrandUsers(brandId) {
    loading.value = true
    const { data } = await supabase
      .from('brand_users')
      .select('id, user_id, role, name, email')
      .eq('brand_id', brandId)
    brandUsers.value = data ?? []
    loading.value = false
  }

  async function updateUserRole(id, role) {
    const { error } = await supabase
      .from('brand_users')
      .update({ role })
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function removeUserFromBrand(brandUserId, userId) {
    try {
      await $fetch('/api/delete-user', {
        method: 'DELETE',
        body: { brandUserId, userId },
      })
      return { error: null }
    } catch (err) {
      return { error: err.data?.message ?? 'Error al eliminar el usuario.' }
    }
  }

  return { brandUsers, loading, fetchBrandUsers, updateUserRole, removeUserFromBrand }
}
