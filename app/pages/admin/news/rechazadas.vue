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

    <NewsDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      @close="showView = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades rechazadas' })

const { newsList, loading, fetchNews, fetchOneNews } = useNews()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const brands = ref([])
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneNews)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'category', label: 'Categoría', width: '140px' },
  { key: 'created_at', label: 'Fecha', width: '110px' },
  { key: 'rejection_reason', label: 'Motivo de rechazo' },
  { key: 'actions', label: '', width: '70px' },
]

watch(filterBrand, () => {
  fetchNews({ status: 'rejected', brandId: filterBrand.value || undefined })
})

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchNews({ status: 'rejected' })
})
</script>
