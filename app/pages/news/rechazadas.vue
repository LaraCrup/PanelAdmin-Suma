<template>
  <div>
    <PageHeader title="Novedades rechazadas" />

    <DataTable
      :columns="columns"
      :rows="newsList"
      :loading="loading"
      emptyMessage="No tenés novedades rechazadas"
    >
      <template #cell-category="{ row }">
        {{ row.news_categories?.name ?? '—' }}
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-rejection_reason="{ row }">
        <span class="text-muted text-sm">{{ row.rejection_reason ?? '—' }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Novedades rechazadas' })

const { newsList, loading, fetchNews } = useNews()

const columns = [
  { key: 'title', label: 'Título' },
  { key: 'category', label: 'Categoría', width: '160px' },
  { key: 'created_at', label: 'Fecha', width: '120px' },
  { key: 'rejection_reason', label: 'Motivo de rechazo' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => fetchNews({ status: 'rejected' }))
</script>
