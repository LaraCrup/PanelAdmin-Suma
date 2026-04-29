<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div v-if="loading" class="flex items-center justify-center py-16 text-primary">
      <LoadingSpinner size="lg" />
    </div>

    <EmptyState v-else-if="!rows.length" :message="emptyMessage" />

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="bg-bg border-b border-border">
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
            class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="row.id ?? i"
          class="border-b border-border last:border-0 hover:bg-bg/50 transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'No hay registros' },
})
</script>
