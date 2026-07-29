export function useBrand() {
  const supabase = useSupabaseClient()
  const { deleteImage } = useImageUpload()
  const brand = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchBrand(brandId) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single()
    brand.value = data
    error.value = err?.message ?? null
    loading.value = false
  }

  async function updateBrand(brandId, data) {
    const { error: err } = await supabase
      .from('brands')
      .update(data)
      .eq('id', brandId)
    return { error: err?.message ?? null }
  }

  async function createBrand(data) {
    const { data: created, error: err } = await supabase
      .from('brands')
      .insert(data)
      .select()
      .single()
    return { data: created, error: err?.message ?? null }
  }

  async function fetchAllBrands() {
    const { data } = await supabase
      .from('brands')
      .select('id, name')
      .order('name')
    return data ?? []
  }

  async function fetchBrandImpact(brandId) {
    const [news, benefits, users] = await Promise.all([
      supabase.from('news').select('id', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('benefits').select('id', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('brand_users').select('id', { count: 'exact', head: true }).eq('brand_id', brandId),
    ])
    return {
      news: news.count ?? 0,
      benefits: benefits.count ?? 0,
      users: users.count ?? 0,
    }
  }

  async function deleteBrand(brandId) {
    const [newsRows, benefitRows, brandRow, brandUsers] = await Promise.all([
      supabase.from('news').select('image_url').eq('brand_id', brandId),
      supabase.from('benefits').select('image_url').eq('brand_id', brandId),
      supabase.from('brands').select('image_url').eq('id', brandId).maybeSingle(),
      supabase.from('brand_users').select('id, user_id').eq('brand_id', brandId),
    ])

    for (const bu of brandUsers.data ?? []) {
      try {
        await $fetch('/api/delete-user', {
          method: 'DELETE',
          body: { userId: bu.user_id, brandUserId: bu.id },
        })
      } catch (err) {
        return { error: err.data?.message ?? 'No se pudieron eliminar los usuarios de la marca.' }
      }
    }

    const { error: err } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId)

    if (err) return { error: err.message }

    const urls = [
      ...(newsRows.data ?? []).map(r => r.image_url),
      ...(benefitRows.data ?? []).map(r => r.image_url),
      brandRow.data?.image_url,
    ]
    for (const url of urls) {
      await deleteImage(url)
    }

    return { error: null }
  }

  return { brand, loading, error, fetchBrand, updateBrand, createBrand, fetchAllBrands, fetchBrandImpact, deleteBrand }
}
