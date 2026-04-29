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
    </DataTable>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Novedades activas' })

const { newsList, loading, fetchNews } = useNews()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const brands = ref([])

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

watch(filterBrand, () => {
  fetchNews({ status: 'approved', brandId: filterBrand.value || undefined })
})

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchNews({ status: 'approved' })
})
</script>
