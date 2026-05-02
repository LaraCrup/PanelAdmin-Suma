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

    <!-- Reject modal con motivo -->
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
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')
const selectedItem = ref(null)

const showView = ref(false)
const viewLoading = ref(false)
const viewItem = ref(null)

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'brands', label: 'Marca', width: '140px' },
  { key: 'valid_until', label: 'Vence', width: '110px' },
  { key: 'level', label: 'Nivel', width: '160px' },
  { key: 'actions', label: '', width: '260px' },
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
  await approveBenefit(selectedItem.value.id, selectedLevel[selectedItem.value.id])
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

async function handleReject() {
  if (!rejectReason.value.trim()) return
  actionLoading.value = selectedItem.value.id + 'r'
  await rejectBenefit(selectedItem.value.id, rejectReason.value.trim())
  closeReject()
  await fetchBenefits({ status: 'pending' })
  actionLoading.value = ''
}

onMounted(async () => {
  await Promise.all([fetchBenefits({ status: 'pending' }), fetchLevels()])
})
</script>
