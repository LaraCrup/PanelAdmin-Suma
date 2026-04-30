import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()

  const user = ref(null)
  const profile = ref(null)
  const brandId = ref(null)
  const brandRole = ref(null)
  const brand = ref(null)

  const isSuperAdmin = computed(() => profile.value?.role === 'superadmin')
  const isBrandAdmin = computed(() => brandRole.value === 'admin')
  const isBrandMember = computed(() => brandRole.value === 'member')

  async function fetchUserData(userId) {
    if (!userId) return

    const { data: { user: authUser } } = await supabase.auth.getUser()
    user.value = authUser

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, role, name, display_name')
      .eq('id', userId)
      .maybeSingle()

    if (profileData?.role === 'superadmin') {
      profile.value = profileData
      return
    }

    const { data: brandUserData } = await supabase
      .from('brand_users')
      .select('brand_id, role, name')
      .eq('user_id', userId)
      .maybeSingle()

    const resolvedName =
      profileData?.display_name ||
      profileData?.name ||
      authUser?.user_metadata?.full_name ||
      brandUserData?.name ||
      ''

    profile.value = {
      id: userId,
      role: profileData?.role ?? 'user',
      name: resolvedName,
      display_name: '',
    }

    if (brandUserData) {
      brandId.value = brandUserData.brand_id
      brandRole.value = brandUserData.role

      const { data: brandData } = await supabase
        .from('brands')
        .select('name, image_url')
        .eq('id', brandUserData.brand_id)
        .single()

      brand.value = brandData
    }
  }

  function clear() {
    user.value = null
    profile.value = null
    brandId.value = null
    brandRole.value = null
    brand.value = null
  }

  return {
    user,
    profile,
    brandId,
    brandRole,
    brand,
    isSuperAdmin,
    isBrandAdmin,
    isBrandMember,
    fetchUserData,
    clear,
  }
})
