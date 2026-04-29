<template>
  <div>
    <PageHeader title="Novedades pendientes" />

    <DataTable
      :columns="columns"
      :rows="newsList"
      :loading="loading"
      emptyMessage="No hay novedades pendientes"
    >
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-category="{ row }">
        {{ row.news_categories?.name ?? '—' }}
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <Button variant="primary" :loading="actionLoading === row.id + 'a'" @click="handleApprove(row.id)">
            Aprobar
          </Button>
          <Button variant="danger" :loading="actionLoading === row.id + 'r'" @click="openReject(row)">
            Rechazar
          </Button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      :show="showConfirm"
      title="Rechazar novedad"
      :message="`¿Rechazás la novedad &quot;${selectedItem?.title}&quot;?`"
      confirmLabel="Rechazar"
      variant="danger"
      @confirm="handleReject"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades pendientes' })

const { newsList, loading, fetchNews, approveNews, rejectNews } = useNews()

const actionLoading = ref('')
const showConfirm = ref(false)
const selectedItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'actions', label: '', width: '180px' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function handleApprove(id) {
  actionLoading.value = id + 'a'
  await approveNews(id)
  await fetchNews({ status: 'pending' })
  actionLoading.value = ''
}

function openReject(item) {
  selectedItem.value = item
  showConfirm.value = true
}

async function handleReject() {
  showConfirm.value = false
  actionLoading.value = selectedItem.value.id + 'r'
  await rejectNews(selectedItem.value.id)
  await fetchNews({ status: 'pending' })
  actionLoading.value = ''
}

onMounted(() => fetchNews({ status: 'pending' }))
</script>
