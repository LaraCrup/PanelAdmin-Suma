<template>
  <div>
    <PageHeader title="Beneficios">
      <template #actions>
        <Button @click="navigateTo('/benefits/nuevo')">+ Nuevo beneficio</Button>
      </template>
    </PageHeader>

    <StatusTabs v-model="filterStatus" :counts="counts" />

    <DataTable
      :columns="columns"
      :rows="filtered"
      :loading="loading"
      emptyMessage="No hay beneficios"
    >
      <template #cell-level="{ row }">
        {{ row.level ?? '—' }}
      </template>
      <template #cell-status="{ row }">
        <Badge :status="row.status" />
      </template>
      <template #cell-valid_until="{ row }">
        {{ formatDate(row.valid_until) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <Button variant="secondary" @click="openView(row)">Ver</Button>
          <Button
            v-if="row.status === 'pending'"
            variant="secondary"
            @click="navigateTo(`/benefits/${row.id}/editar`)"
          >
            Editar
          </Button>
          <Button variant="danger" @click="confirmDelete(row)">Eliminar</Button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      :show="showDeleteModal"
      title="Eliminar beneficio"
      message="¿Estás seguro de que querés eliminar este beneficio? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

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
        <div v-if="viewItem.rejection_reason" class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p class="text-xs font-semibold text-red-500 mb-1">Motivo de rechazo</p>
          <p class="text-sm text-red-700 whitespace-pre-wrap">{{ viewItem.rejection_reason }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Beneficios' })

const { benefitsList, loading, fetchBenefits, fetchOneBenefit, deleteBenefit } = useBenefits()

const filterStatus = ref('')
const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'level', label: 'Nivel', width: '80px' },
  { key: 'status', label: 'Estado', width: '120px' },
  { key: 'valid_until', label: 'Vence', width: '120px' },
  { key: 'actions', label: '', width: '160px' },
]

const filtered = computed(() =>
  filterStatus.value
    ? benefitsList.value.filter(b => b.status === filterStatus.value)
    : benefitsList.value
)

const counts = computed(() => ({
  '': benefitsList.value.length,
  pending: benefitsList.value.filter(b => b.status === 'pending').length,
  approved: benefitsList.value.filter(b => b.status === 'approved').length,
  rejected: benefitsList.value.filter(b => b.status === 'rejected').length,
}))

const showDeleteModal = ref(false)
const benefitToDelete = ref(null)

function confirmDelete(row) {
  benefitToDelete.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  showDeleteModal.value = false
  await deleteBenefit(benefitToDelete.value.id)
  await fetchBenefits()
}

async function openView(row) {
  showView.value = true
  viewLoading.value = true
  viewItem.value = null
  const { data } = await fetchOneBenefit(row.id)
  viewItem.value = data
  viewLoading.value = false
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => fetchBenefits())
</script>
