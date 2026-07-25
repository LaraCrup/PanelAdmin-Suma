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
          <Button variant="secondary" @click="openView(row)">Ver</Button>
          <Button variant="secondary" @click="navigateTo(`/admin/news/${row.id}/editar`)">Editar</Button>
          <Button variant="primary" :loading="actionLoading === row.id + 'a'" @click="handleApprove(row.id)">
            Aprobar
          </Button>
          <Button variant="danger" :loading="actionLoading === row.id + 'r'" @click="openReject(row)">
            Rechazar
          </Button>
        </div>
      </template>
    </DataTable>

    <NewsDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      @close="showView = false"
    />

    <Modal :show="showReject" title="Rechazar novedad" size="md" @close="closeReject">
      <div class="flex flex-col gap-4 pt-2">
        <p class="text-sm text-muted">
          ¿Rechazás la novedad <span class="font-semibold text-text">{{ selectedItem?.title }}</span>?
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-text">Motivo de rechazo</label>
          <textarea
            v-model="rejectReason"
            rows="4"
            placeholder="Explicá por qué se rechaza esta novedad..."
            class="w-full rounded-xl border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="closeReject">Cancelar</Button>
        <Button
          variant="danger"
          :loading="actionLoading === selectedItem?.id + 'r'"
          :disabled="!rejectReason.trim()"
          @click="handleReject"
        >
          Rechazar
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades pendientes' })

const { newsList, loading, fetchNews, fetchOneNews, approveNews, rejectNews } = useNews()

const actionLoading = ref('')
const showReject = ref(false)
const rejectReason = ref('')
const selectedItem = ref(null)
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneNews)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'actions', label: '', width: '320px' },
]

async function handleApprove(id) {
  actionLoading.value = id + 'a'
  await approveNews(id)
  await fetchNews({ status: 'pending' })
  actionLoading.value = ''
}

function openReject(item) {
  selectedItem.value = item
  rejectReason.value = ''
  showReject.value = true
}

function closeReject() {
  showReject.value = false
  rejectReason.value = ''
  selectedItem.value = null
}

async function handleReject() {
  if (!rejectReason.value.trim()) return
  actionLoading.value = selectedItem.value.id + 'r'
  await rejectNews(selectedItem.value.id, rejectReason.value.trim())
  showReject.value = false
  rejectReason.value = ''
  await fetchNews({ status: 'pending' })
  actionLoading.value = ''
  selectedItem.value = null
}

onMounted(() => fetchNews({ status: 'pending' }))
</script>
