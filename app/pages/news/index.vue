<template>
  <div>
    <PageHeader title="Novedades">
      <template #actions>
        <Button @click="navigateTo('/news/nueva')">+ Nueva novedad</Button>
      </template>
    </PageHeader>

    <StatusTabs v-model="filterStatus" :counts="counts" />

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
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
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

const { newsList, loading, fetchNews, deleteNews } = useNews()

const filterStatus = ref('')

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'status', label: 'Estado', width: '120px' },
  { key: 'publication_date', label: 'Fecha de publicación', width: '160px' },
  { key: 'actions', label: '', width: '100px' },
]

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

function confirmDelete(row) {
  newsToDelete.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  showDeleteModal.value = false
  await deleteNews(newsToDelete.value.id)
  await fetchNews()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => fetchNews())
</script>
