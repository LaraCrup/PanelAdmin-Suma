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

    <Modal :show="showView" title="Detalle de novedad" size="lg" @close="showView = false">
      <div v-if="viewLoading" class="flex justify-center py-8">
        <LoadingSpinner size="lg" class="text-primary" />
      </div>
      <div v-else-if="viewItem" class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-4 text-sm text-muted">
          <span><span class="font-semibold text-text">Categoría:</span> {{ viewItem.news_categories?.name ?? '—' }}</span>
          <span><span class="font-semibold text-text">Fecha:</span> {{ formatDate(viewItem.created_at) }}</span>
        </div>
        <h2 class="font-heading text-xl font-bold text-text">{{ viewItem.title }}</h2>
        <img v-if="viewItem.image_url" :src="viewItem.image_url" :alt="viewItem.title" class="rounded-xl w-full object-cover max-h-64" />
        <p class="text-text whitespace-pre-wrap leading-relaxed">{{ viewItem.content }}</p>
        <div v-if="viewItem.rejection_reason" class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p class="text-xs font-semibold text-red-500 mb-1">Motivo de rechazo</p>
          <p class="text-sm text-red-700 whitespace-pre-wrap">{{ viewItem.rejection_reason }}</p>
        </div>
      </div>
    </Modal>

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

const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

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

async function openView(row) {
  showView.value = true
  viewLoading.value = true
  viewItem.value = null
  const { data } = await fetchOneNews(row.id)
  viewItem.value = data
  viewLoading.value = false
}

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
