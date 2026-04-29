<template>
  <div>
    <PageHeader title="Novedades">
      <template #actions>
        <Button @click="navigateTo('/news/nueva')">+ Nueva novedad</Button>
      </template>
    </PageHeader>

    <StatusTabs v-model="filterStatus" :counts="counts" />

    <DataTable
      :columns="columns"
      :rows="filtered"
      :loading="loading"
      emptyMessage="No hay novedades"
    >
      <template #cell-category="{ row }">
        {{ row.news_categories?.name ?? '—' }}
      </template>
      <template #cell-status="{ row }">
        <Badge :status="row.status" />
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-actions="{ row }">
        <Button
          v-if="row.status === 'pending'"
          variant="secondary"
          @click="navigateTo(`/news/${row.id}/editar`)"
        >
          Editar
        </Button>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Novedades' })

const { newsList, loading, fetchNews } = useNews()

const filterStatus = ref('')

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'status', label: 'Estado', width: '120px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'actions', label: '', width: '100px' },
]

const filtered = computed(() =>
  filterStatus.value
    ? newsList.value.filter(n => n.status === filterStatus.value)
    : newsList.value
)

const counts = computed(() => ({
  '': newsList.value.length,
  pending: newsList.value.filter(n => n.status === 'pending').length,
  approved: newsList.value.filter(n => n.status === 'approved').length,
  rejected: newsList.value.filter(n => n.status === 'rejected').length,
}))

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => fetchNews())
</script>
