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
          <Button variant="primary" :loading="actionLoading === row.id + 'a'" @click="handleApprove(row.id)">
            Aprobar
          </Button>
          <Button variant="danger" :loading="actionLoading === row.id + 'r'" @click="openReject(row)">
            Rechazar
          </Button>
        </div>
      </template>
    </DataTable>

    <!-- Modal ver detalle -->
    <Modal :show="showView" title="Detalle de novedad" size="lg" @close="showView = false">
      <div v-if="viewLoading" class="flex justify-center py-8">
        <LoadingSpinner size="lg" class="text-primary" />
      </div>
      <div v-else-if="viewItem" class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-4 text-sm text-muted">
          <span><span class="font-semibold text-text">Marca:</span> {{ viewItem.brands?.name ?? '—' }}</span>
          <span><span class="font-semibold text-text">Categoría:</span> {{ viewItem.news_categories?.name ?? '—' }}</span>
          <span><span class="font-semibold text-text">Fecha:</span> {{ formatDate(viewItem.created_at) }}</span>
        </div>
        <h2 class="font-heading text-xl font-bold text-text">{{ viewItem.title }}</h2>
        <img v-if="viewItem.image_url" :src="viewItem.image_url" :alt="viewItem.title" class="rounded-xl w-full object-cover max-h-64" />
        <p class="text-text whitespace-pre-wrap leading-relaxed">{{ viewItem.content }}</p>
      </div>
    </Modal>

    <!-- Modal rechazar con motivo -->
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

const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'actions', label: '', width: '240px' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function openView(row) {
  showView.value = true
  viewLoading.value = true
  viewItem.value = null
  const { data } = await fetchOneNews(row.id)
  viewItem.value = data
  viewLoading.value = false
}

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
