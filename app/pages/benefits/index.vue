<template>
  <div>
    <PageHeader title="Beneficios">
      <template #actions>
        <Button @click="navigateTo('/benefits/nuevo')">+ Nuevo beneficio</Button>
      </template>
    </PageHeader>

    <StatusTabs v-model="filterStatus" :counts="counts" />

    <p v-if="errorMsg" class="text-sm text-red-500 mb-4">{{ errorMsg }}</p>

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

    <BenefitDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      @close="showView = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Beneficios' })

const { benefitsList, loading, fetchBenefits, fetchOneBenefit, deleteBenefit } = useBenefits()

const filterStatus = ref('')
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneBenefit)

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
const errorMsg = ref('')

function confirmDelete(row) {
  benefitToDelete.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  showDeleteModal.value = false
  errorMsg.value = ''
  const { error } = await deleteBenefit(benefitToDelete.value.id)
  if (error) errorMsg.value = 'No se pudo eliminar el beneficio.'
  await fetchBenefits()
}

onMounted(() => fetchBenefits())
</script>
