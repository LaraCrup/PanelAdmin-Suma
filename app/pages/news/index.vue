<template>
  <div>
    <PageHeader title="Novedades">
      <template #actions>
        <Button @click="navigateTo('/news/nueva')">+ Nueva novedad</Button>
      </template>
    </PageHeader>

    <StatusTabs v-model="filterStatus" :counts="counts" />

    <p v-if="errorMsg" class="text-sm text-red-500 mb-4">{{ errorMsg }}</p>

    <DataTable
      :columns="columns"
      :rows="filtered"
      :loading="loading"
      emptyMessage="No hay novedades"
    >
      <template #cell-category="{ row }">
        {{ row.news_categories?.name ?? '—' }}
      </template>
      <template #cell-status="{ row }">
        <Badge :status="row.status" />
      </template>
      <template #cell-publication_date="{ row }">
        {{ formatDate(row.publication_date) }}
      </template>
      <template #cell-rejection_reason="{ row }">
        <span class="text-muted text-sm">{{ row.rejection_reason ?? '—' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <Button variant="secondary" @click="openView(row)">Ver</Button>
          <Button
            v-if="row.status === 'pending'"
            variant="secondary"
            @click="navigateTo(`/news/${row.id}/editar`)"
          >
            Editar
          </Button>
          <Button variant="danger" @click="confirmDelete(row)">Eliminar</Button>
        </div>
      </template>
    </DataTable>

    <NewsDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      :show-brand="false"
      @close="showView = false"
    />

    <ConfirmModal
      :show="showDeleteModal"
      title="Eliminar novedad"
      message="¿Estás seguro de que querés eliminar esta novedad? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Novedades' })

const { newsList, loading, fetchNews, fetchOneNews, deleteNews } = useNews()

const filterStatus = ref('')
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneNews)

const columns = computed(() => {
  const base = [
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoría', width: '160px' },
    { key: 'status', label: 'Estado', width: '120px' },
    { key: 'publication_date', label: 'Fecha de publicación', width: '160px' },
  ]
  if (filterStatus.value === 'rejected') {
    base.push({ key: 'rejection_reason', label: 'Motivo de rechazo' })
  }
  base.push({ key: 'actions', label: '', width: '200px' })
  return base
})

const filtered = computed(() =>
  filterStatus.value
    ? newsList.value.filter(n => n.status === filterStatus.value)
    : newsList.value
)

const counts = computed(() => ({
  '': newsList.value.length,
  pending: newsList.value.filter(n => n.status === 'pending').length,
  approved: newsList.value.filter(n => n.status === 'approved').length,
  rejected: newsList.value.filter(n => n.status === 'rejected').length,
}))

const showDeleteModal = ref(false)
const newsToDelete = ref(null)
const errorMsg = ref('')

function confirmDelete(row) {
  newsToDelete.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  showDeleteModal.value = false
  errorMsg.value = ''
  const { error } = await deleteNews(newsToDelete.value.id)
  if (error) errorMsg.value = 'No se pudo eliminar la novedad.'
  await fetchNews()
}

onMounted(() => fetchNews())
</script>
