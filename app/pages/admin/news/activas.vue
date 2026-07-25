<template>
  <div>
    <PageHeader title="Novedades activas" />

    <div class="flex gap-3 mb-6">
      <BrandFilterSelect v-model="filterBrand" :brands="brands" />
    </div>

    <DataTable
      :columns="columns"
      :rows="newsList"
      :loading="loading"
      emptyMessage="No hay novedades aprobadas"
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
        </div>
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
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades activas' })

const { newsList, loading, fetchNews, fetchOneNews } = useNews()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const brands = ref([])
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneNews)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'actions', label: '', width: '150px' },
]

watch(filterBrand, () => {
  fetchNews({ status: 'approved', brandId: filterBrand.value || undefined })
})

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchNews({ status: 'approved' })
})
</script>
