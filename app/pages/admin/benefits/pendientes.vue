<template>
  <div>
    <PageHeader title="Beneficios pendientes" />

    <p v-if="errorMsg" class="text-sm text-red-500 mb-4">{{ errorMsg }}</p>

    <DataTable
      :columns="columns"
      :rows="benefitsList"
      :loading="loading"
      emptyMessage="No hay beneficios pendientes"
    >
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-valid_until="{ row }">
        {{ formatDate(row.valid_until) }}
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
          <Button variant="secondary" @click="openView(row)">Ver</Button>
          <Button variant="secondary" @click="navigateTo(`/admin/benefits/${row.id}/editar`)">Editar</Button>
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

    <BenefitDetailModal
      :show="showView"
      :loading="viewLoading"
      :item="viewItem"
      @close="showView = false"
    />

    <Modal :show="showApproveModal" title="Confirmar aprobación" @close="showApproveModal = false">
      <p class="text-sm text-muted mb-2">
        ¿Aprobás el beneficio <strong class="text-text">{{ selectedItem?.title }}</strong>
        con nivel <strong class="text-primary">{{ selectedLevel[selectedItem?.id] }}</strong>?
      </p>
      <template #footer>
        <Button variant="secondary" @click="showApproveModal = false">Cancelar</Button>
        <Button :loading="actionLoading === selectedItem?.id + 'a'" @click="handleApprove">Confirmar</Button>
      </template>
    </Modal>

    <Modal :show="showRejectModal" title="Rechazar beneficio" size="md" @close="closeReject">
      <div class="flex flex-col gap-4 pt-2">
        <p class="text-sm text-muted">
          ¿Rechazás el beneficio <span class="font-semibold text-text">{{ selectedItem?.title }}</span>?
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-text">Motivo de rechazo</label>
          <textarea
            v-model="rejectReason"
            rows="4"
            placeholder="Explicá por qué se rechaza este beneficio..."
            class="w-full rounded-xl border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="closeReject">Cancelar</Button>
        <Button
          variant="danger"
          :loading="actionLoading === selectedItem?.id + 'r'"
          :disabled="!rejectReason.trim()"
          @click="handleReject"
        >
          Rechazar
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Beneficios pendientes' })

const { benefitsList, loading, fetchBenefits, fetchOneBenefit, approveBenefit, rejectBenefit } = useBenefits()
const { levelOptions, fetchLevels } = useLevels()

const selectedLevel = reactive({})
const actionLoading = ref('')
const errorMsg = ref('')
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')
const selectedItem = ref(null)
const { showView, viewLoading, viewItem, openView } = useDetailModal(fetchOneBenefit)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'valid_until', label: 'Vence', width: '110px' },
  { key: 'level', label: 'Nivel', width: '160px' },
  { key: 'actions', label: '', width: '330px' },
]

function openApprove(item) {
  selectedItem.value = item
  showApproveModal.value = true
}

function openReject(item) {
  selectedItem.value = item
  rejectReason.value = ''
  showRejectModal.value = true
}

function closeReject() {
  showRejectModal.value = false
  rejectReason.value = ''
  selectedItem.value = null
}

async function handleApprove() {
  showApproveModal.value = false
  actionLoading.value = selectedItem.value.id + 'a'
  errorMsg.value = ''
  const { error } = await approveBenefit(selectedItem.value.id, selectedLevel[selectedItem.value.id])
  if (error) errorMsg.value = 'No se pudo aprobar el beneficio. Intentá de nuevo.'
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

async function handleReject() {
  if (!rejectReason.value.trim()) return
  actionLoading.value = selectedItem.value.id + 'r'
  errorMsg.value = ''
  const { error } = await rejectBenefit(selectedItem.value.id, rejectReason.value.trim())
  if (error) errorMsg.value = 'No se pudo rechazar el beneficio. Intentá de nuevo.'
  closeReject()
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

onMounted(async () => {
  await Promise.all([fetchBenefits({ status: 'pending' }), fetchLevels()])
})
</script>
