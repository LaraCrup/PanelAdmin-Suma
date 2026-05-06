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
        <Button variant="secondary" @click="openView(row)">Ver</Button>
      </template>
    </DataTable>

    <Modal :show="showView" title="Detalle de beneficio" size="lg" @close="showView = false">
      <div v-if="viewLoading" class="flex justify-center py-8">
        <LoadingSpinner size="lg" class="text-primary" />
      </div>
      <div v-else-if="viewItem" class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-4 text-sm text-muted">
          <span><span class="font-semibold text-text">Marca:</span> {{ viewItem.brands?.name ?? '—' }}</span>
          <span><span class="font-semibold text-text">Nivel:</span> {{ viewItem.level ?? '—' }}</span>
          <span><span class="font-semibold text-text">Vence:</span> {{ formatDate(viewItem.valid_until) }}</span>
        </div>
        <h2 class="font-heading text-xl font-bold text-text">{{ viewItem.title }}</h2>
        <img v-if="viewItem.image_url" :src="viewItem.image_url" :alt="viewItem.title" class="rounded-xl w-full object-cover max-h-64" />
        <p class="text-text whitespace-pre-wrap leading-relaxed">{{ viewItem.description }}</p>
        <div v-if="viewItem.discount_code" class="text-sm">
          <span class="font-semibold text-text">Código de descuento:</span> {{ viewItem.discount_code }}
        </div>
        <div v-if="viewItem.terms_conditions" class="text-sm">
          <span class="font-semibold text-text">Términos y condiciones:</span>
          <p class="mt-1 text-muted whitespace-pre-wrap">{{ viewItem.terms_conditions }}</p>
        </div>
      </div>
    </Modal>
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

const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '160px' },
  { key: 'level', label: 'Nivel', width: '80px' },
  { key: 'valid_until', label: 'Vence', width: '120px' },
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
  const { data } = await fetchOneBenefit(row.id)
  viewItem.value = data
  viewLoading.value = false
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
