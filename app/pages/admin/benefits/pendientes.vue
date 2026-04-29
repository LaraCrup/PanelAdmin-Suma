<template>
  <div>
    <PageHeader title="Beneficios pendientes" />

    <DataTable
      :columns="columns"
      :rows="benefitsList"
      :loading="loading"
      emptyMessage="No hay beneficios pendientes"
    >
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-discount="{ row }">
        {{ row.discount != null ? row.discount + '%' : '—' }}
      </template>
      <template #cell-level="{ row }">
        <SelectField
          :modelValue="selectedLevel[row.id] ?? ''"
          :options="levelOptions"
          placeholder="Nivel..."
          @update:modelValue="selectedLevel[row.id] = $event"
        />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <Button
            variant="primary"
            :disabled="!selectedLevel[row.id]"
            :loading="actionLoading === row.id + 'a'"
            @click="openApprove(row)"
          >
            Aprobar
          </Button>
          <Button
            variant="danger"
            :loading="actionLoading === row.id + 'r'"
            @click="openReject(row)"
          >
            Rechazar
          </Button>
        </div>
      </template>
    </DataTable>

    <!-- Approve confirmation -->
    <Modal :show="showApproveModal" title="Confirmar aprobación" @close="showApproveModal = false">
      <p class="text-sm text-muted mb-2">
        ¿Aprobás el beneficio <strong class="text-text">{{ selectedItem?.title }}</strong>
        con nivel <strong class="text-primary">{{ selectedLevel[selectedItem?.id] }}</strong>?
      </p>
      <template #footer>
        <Button variant="secondary" @click="showApproveModal = false">Cancelar</Button>
        <Button :loading="actionLoading.includes('a')" @click="handleApprove">Confirmar</Button>
      </template>
    </Modal>

    <!-- Reject confirmation -->
    <ConfirmModal
      :show="showRejectModal"
      title="Rechazar beneficio"
      :message="`¿Rechazás el beneficio &quot;${selectedItem?.title}&quot;?`"
      confirmLabel="Rechazar"
      variant="danger"
      @confirm="handleReject"
      @cancel="showRejectModal = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Beneficios pendientes' })

const { benefitsList, loading, fetchBenefits, approveBenefit, rejectBenefit } = useBenefits()
const { levelOptions, fetchLevels } = useLevels()

const selectedLevel = reactive({})
const actionLoading = ref('')
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'discount', label: 'Descuento', width: '100px' },
  { key: 'level', label: 'Nivel', width: '160px' },
  { key: 'actions', label: '', width: '200px' },
]

function openApprove(item) {
  selectedItem.value = item
  showApproveModal.value = true
}

function openReject(item) {
  selectedItem.value = item
  showRejectModal.value = true
}

async function handleApprove() {
  showApproveModal.value = false
  actionLoading.value = selectedItem.value.id + 'a'
  await approveBenefit(selectedItem.value.id, selectedLevel[selectedItem.value.id])
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

async function handleReject() {
  showRejectModal.value = false
  actionLoading.value = selectedItem.value.id + 'r'
  await rejectBenefit(selectedItem.value.id)
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

onMounted(async () => {
  await Promise.all([fetchBenefits({ status: 'pending' }), fetchLevels()])
})
</script>
