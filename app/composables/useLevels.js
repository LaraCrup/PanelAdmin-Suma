export function useLevels() {
  const supabase = useSupabaseClient()
  const levels = ref([])

  async function fetchLevels() {
    const { data } = await supabase
      .from('levels')
      .select('level_number, xp_required')
      .order('level_number')
    levels.value = data ?? []
  }

  const levelOptions = computed(() =>
    levels.value.map(l => ({ value: l.level_number, label: `Nivel ${l.level_number}` }))
  )

  return { levels, levelOptions, fetchLevels }
}
