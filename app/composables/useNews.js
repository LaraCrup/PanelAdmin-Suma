export function useNews() {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const newsList = ref([])
  const loading = ref(false)

  async function fetchNews(filters = {}) {
    loading.value = true
    let query = supabase
      .from('news')
      .select('id, title, status, created_at, publication_date, brand_id, rejection_reason, brands!news_brand_id_fkey(name), news_categories!news_category_id_fkey(name)')
      .order('created_at', { ascending: false })

    if (!authStore.isSuperAdmin && authStore.brandId) {
      query = query.eq('brand_id', authStore.brandId)
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.brandId) query = query.eq('brand_id', filters.brandId)

    const { data, error } = await query
    if (error) console.error('[fetchNews]', error.message)
    newsList.value = data ?? []
    loading.value = false
  }

  async function fetchOneNews(id) {
    const { data, error } = await supabase
      .from('news')
      .select('*, brands!news_brand_id_fkey(name), news_categories!news_category_id_fkey(name)')
      .eq('id', id)
      .single()
    return { data, error: error?.message ?? null }
  }

  async function createNews(data) {
    const today = new Date().toISOString().split('T')[0]
    if (data.publication_date && data.publication_date > today) {
      return { error: 'La fecha de publicación no puede ser una fecha futura.' }
    }
    const payload = {
      ...data,
      brand_id: authStore.brandId,
      status: 'pending',
      category_id: data.category_id || null,
      publication_date: data.publication_date || null,
    }
    const { error } = await supabase.from('news').insert(payload)
    return { error: error?.message ?? null }
  }

  async function deleteNews(id) {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function updateNews(id, data) {
    const today = new Date().toISOString().split('T')[0]
    if (data.publication_date && data.publication_date > today) {
      return { error: 'La fecha de publicación no puede ser una fecha futura.' }
    }
    const payload = {
      ...data,
      category_id: data.category_id || null,
      publication_date: data.publication_date || null,
    }
    const { error } = await supabase
      .from('news')
      .update(payload)
      .eq('id', id)
      .eq('status', 'pending')
    return { error: error?.message ?? null }
  }

  async function approveNews(id) {
    const { error } = await supabase
      .from('news')
      .update({ status: 'approved' })
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function rejectNews(id, reason) {
    const { error } = await supabase
      .from('news')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
    return { error: error?.message ?? null }
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from('news_categories')
      .select('id, name')
      .order('name')
    return data ?? []
  }

  return {
    newsList,
    loading,
    fetchNews,
    fetchOneNews,
    createNews,
    updateNews,
    deleteNews,
    approveNews,
    rejectNews,
    fetchCategories,
  }
}
