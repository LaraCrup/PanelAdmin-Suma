export function useDetailModal(fetchOne) {
  const showView = ref(false)
  const viewLoading = ref(false)
  const viewItem = ref(null)

  async function openView(row) {
    showView.value = true
    viewLoading.value = true
    viewItem.value = null
    const { data } = await fetchOne(row.id)
    viewItem.value = data
    viewLoading.value = false
  }

  return { showView, viewLoading, viewItem, openView }
}
