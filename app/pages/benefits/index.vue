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
      <template #cell-brands="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-discount="{ row }">
        {{ row.discount ? row.discount + '%' : '—' }}
      </template>
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
        <Button
          v-if="row.status === 'pending'"
          variant="secondary"
          @click="navigateTo(`/benefits/${row.id}/editar`)"
        >
          Editar
        </Button>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Beneficios' })

const { benefitsList, loading, fetchBenefits } = useBenefits()

const filterStatus = ref('')

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'discount', label: 'Descuento', width: '100px' },
  { key: 'level', label: 'Nivel', width: '80px' },
  { key: 'status', label: 'Estado', width: '120px' },
  { key: 'valid_until', label: 'Vence', width: '120px' },
  { key: 'actions', label: '', width: '100px' },
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

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => fetchBenefits())
</script>
