export function useNews() {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const newsList = ref([])
  const loading = ref(false)

  async function fetchNews(filters = {}) {
    loading.value = true
    let query = supabase
      .from('news')
      .select('id, title, status, created_at, brand_id, news_categories(name), brands(name)')
      .order('created_at', { ascending: false })

    if (!authStore.isSuperAdmin && authStore.brandId) {
      query = query.eq('brand_id', authStore.brandId)
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.brandId) query = query.eq('brand_id', filters.brandId)

    const { data } = await query
    newsList.value = data ?? []
    loading.value = false
  }

  async function fetchOneNews(id) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error: error?.message ?? null }
  }

  async function createNews(data) {
    const { error } = await supabase.from('news').insert({
      ...data,
      brand_id: authStore.brandId,
      status: 'pending',
    })
    return { error: error?.message ?? null }
  }

  async function updateNews(id, data) {
    const { error } = await supabase
      .from('news')
      .update(data)
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

  async function rejectNews(id) {
    const { error } = await supabase
      .from('news')
      .update({ status: 'rejected' })
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
    approveNews,
    rejectNews,
    fetchCategories,
  }
}
