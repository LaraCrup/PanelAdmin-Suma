export function useBrandUsers() {
  const supabase = useSupabaseClient()
  const brandUsers = ref([])
  const loading = ref(false)

  async function fetchBrandUsers(brandId) {
    loading.value = true
    const { data } = await supabase
      .from('brand_users')
      .select('id, user_id, role, profiles(name, display_name)')
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

  async function removeUserFromBrand(id) {
    const { error } = await supabase
      .from('brand_users')
      .delete()
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  return { brandUsers, loading, fetchBrandUsers, updateUserRole, removeUserFromBrand }
}
