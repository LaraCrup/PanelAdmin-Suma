<template>
  <div>
    <PageHeader title="Beneficios activos" />

    <div class="flex gap-3 mb-6">
      <BrandFilterSelect v-model="filterBrand" :brands="brands" />
      <SelectField
        v-model="filterLevel"
        :options="levelOptions"
        placeholder="Todos los niveles"
      />
    </div>

    <DataTable
      :columns="columns"
      :rows="benefitsList"
      :loading="loading"
      emptyMessage="No hay beneficios activos"
    >
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-discount="{ row }">
        {{ row.discount != null ? row.discount + '%' : '—' }}
      </template>
      <template #cell-level="{ row }">
        {{ row.level ?? '—' }}
      </template>
      <template #cell-valid_until="{ row }">
        {{ formatDate(row.valid_until) }}
      </template>
    </DataTable>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Beneficios activos' })

const { benefitsList, loading, fetchBenefits } = useBenefits()
const { levelOptions, fetchLevels } = useLevels()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const filterLevel = ref('')
const brands = ref([])

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'discount', label: 'Descuento', width: '100px' },
  { key: 'level', label: 'Nivel', width: '80px' },
  { key: 'valid_until', label: 'Vence', width: '120px' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function applyFilters() {
  fetchBenefits({
    status: 'approved',
    brandId: filterBrand.value || undefined,
    level: filterLevel.value || undefined,
  })
}

watch([filterBrand, filterLevel], applyFilters)

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchLevels()
  applyFilters()
})
</script>
