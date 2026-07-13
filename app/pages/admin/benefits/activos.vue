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
      <template #cell-level="{ row }">
        {{ row.level ?? '—' }}
      </template>
      <template #cell-valid_until="{ row }">
        {{ formatDate(row.valid_until) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <Button variant="secondary" @click="openView(row)">Ver</Button>
          <Button variant="secondary" @click="navigateTo(`/admin/benefits/${row.id}/editar`)">Editar</Button>
        </div>
      </template>
    </DataTable>

    <BenefitDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      @close="showView = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Beneficios activos' })

const { benefitsList, loading, fetchBenefits, fetchOneBenefit } = useBenefits()
const { levelOptions, fetchLevels } = useLevels()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const filterLevel = ref('')
const brands = ref([])
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneBenefit)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'level', label: 'Nivel', width: '80px' },
  { key: 'valid_until', label: 'Vence', width: '120px' },
  { key: 'actions', label: '', width: '150px' },
]

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
