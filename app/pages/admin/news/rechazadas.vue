<template>
  <div>
    <PageHeader title="Novedades rechazadas" />

    <div class="flex gap-3 mb-6">
      <BrandFilterSelect v-model="filterBrand" :brands="brands" />
    </div>

    <DataTable
      :columns="columns"
      :rows="newsList"
      :loading="loading"
      emptyMessage="No hay novedades rechazadas"
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
      <template #cell-rejection_reason="{ row }">
        <span class="text-muted text-sm">{{ row.rejection_reason ?? '—' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <Button variant="secondary" @click="openView(row)">Ver</Button>
      </template>
    </DataTable>

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
        <div v-if="viewItem.rejection_reason" class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p class="text-xs font-semibold text-red-500 mb-1">Motivo de rechazo</p>
          <p class="text-sm text-red-700 whitespace-pre-wrap">{{ viewItem.rejection_reason }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades rechazadas' })

const { newsList, loading, fetchNews, fetchOneNews } = useNews()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const brands = ref([])

const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'category', label: 'Categoría', width: '140px' },
  { key: 'created_at', label: 'Fecha', width: '110px' },
  { key: 'rejection_reason', label: 'Motivo de rechazo' },
  { key: 'actions', label: '', width: '70px' },
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

watch(filterBrand, () => {
  fetchNews({ status: 'rejected', brandId: filterBrand.value || undefined })
})

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchNews({ status: 'rejected' })
})
</script>
