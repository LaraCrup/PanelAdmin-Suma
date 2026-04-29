export function useBrand() {
  const supabase = useSupabaseClient()
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

  async function deleteBrand(brandId) {
    const { error: err } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId)
    return { error: err?.message ?? null }
  }

  return { brand, loading, error, fetchBrand, updateBrand, createBrand, fetchAllBrands, deleteBrand }
}
