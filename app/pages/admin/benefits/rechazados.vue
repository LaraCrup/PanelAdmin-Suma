<template>
  <div>
    <PageHeader title="Beneficios rechazados" />

    <div class="flex gap-3 mb-6">
      <BrandFilterSelect v-model="filterBrand" :brands="brands" />
    </div>

    <DataTable
      :columns="columns"
      :rows="benefitsList"
      :loading="loading"
      emptyMessage="No hay beneficios rechazados"
    >
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-valid_until="{ row }">
        {{ formatDate(row.valid_until) }}
      </template>
      <template #cell-rejection_reason="{ row }">
        <span class="text-muted text-sm">{{ row.rejection_reason ?? '—' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <Button variant="secondary" @click="openView(row)">Ver</Button>
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
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Beneficios rechazados' })

const { benefitsList, loading, fetchBenefits, fetchOneBenefit } = useBenefits()
const { fetchAllBrands } = useBrand()

const filterBrand = ref('')
const brands = ref([])
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneBenefit)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'valid_until', label: 'Vence', width: '110px' },
  { key: 'rejection_reason', label: 'Motivo de rechazo' },
  { key: 'actions', label: '', width: '70px' },
]

watch(filterBrand, () => {
  fetchBenefits({ status: 'rejected', brandId: filterBrand.value || undefined })
})

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchBenefits({ status: 'rejected' })
})
</script>
