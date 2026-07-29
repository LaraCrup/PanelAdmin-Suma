export function useBenefits() {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const { deleteImage } = useImageUpload()
  const benefitsList = ref([])
  const loading = ref(false)

  async function fetchBenefits(filters = {}) {
    loading.value = true
    let query = supabase
      .from('benefits')
      .select('id, title, description, discount_code, status, level, brand_id, valid_until, rejection_reason, created_at, brands!benefits_brand_id_fkey(name)')
      .order('created_at', { ascending: false })

    if (!authStore.isSuperAdmin && authStore.brandId) {
      query = query.eq('brand_id', authStore.brandId)
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.brandId) query = query.eq('brand_id', filters.brandId)
    if (filters.level) query = query.eq('level', filters.level)

    const { data, error } = await query
    if (error) console.error('[useBenefits] fetchBenefits error:', error)
    benefitsList.value = data ?? []
    loading.value = false
  }

  async function fetchOneBenefit(id) {
    const { data, error } = await supabase
      .from('benefits')
      .select('*, brands!benefits_brand_id_fkey(name)')
      .eq('id', id)
      .single()
    return { data, error: error?.message ?? null }
  }

  async function createBenefit(data) {
    const { error } = await supabase.from('benefits').insert({
      ...data,
      brand_id: authStore.brandId,
      created_by: authStore.profile?.id,
      status: 'pending',
    })
    return { error: error?.message ?? null }
  }

  async function updateBenefit(id, data) {
    const { data: updated, error } = await supabase
      .from('benefits')
      .update(data)
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
    if (error) return { error: error.message }
    if (!updated?.length) return { error: 'El beneficio ya no está pendiente y no se puede editar.' }
    return { error: null }
  }

  async function adminUpdateBenefit(id, data) {
    if (!authStore.isSuperAdmin) return { error: 'No autorizado' }
    const { error } = await supabase
      .from('benefits')
      .update(data)
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function approveBenefit(id, levelNumber) {
    const { error } = await supabase
      .from('benefits')
      .update({ status: 'approved', level: levelNumber })
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function rejectBenefit(id, reason) {
    const { error } = await supabase
      .from('benefits')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function deleteBenefit(id) {
    const { data: item } = await supabase
      .from('benefits')
      .select('image_url')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('benefits').delete().eq('id', id)

    if (error) return { error: error.message }

    await deleteImage(item?.image_url)
    return { error: null }
  }

  return {
    benefitsList,
    loading,
    fetchBenefits,
    fetchOneBenefit,
    createBenefit,
    updateBenefit,
    adminUpdateBenefit,
    approveBenefit,
    rejectBenefit,
    deleteBenefit,
  }
}
