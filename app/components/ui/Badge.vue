<template>
  <span :style="badgeStyle" class="px-3 py-1 text-xs font-semibold rounded-full inline-block">
    {{ label }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, required: true },
  genero: { type: String, default: 'm' },
})

const map = {
  pending:  { bg: '#FEF3C7', text: '#D97706', m: 'Pendiente', f: 'Pendiente'  },
  approved: { bg: '#D1FAE5', text: '#059669', m: 'Aprobado',  f: 'Aprobada'   },
  rejected: { bg: '#FEE2E2', text: '#DC2626', m: 'Rechazado', f: 'Rechazada'  },
}

const badgeStyle = computed(() => ({
  backgroundColor: map[props.status]?.bg ?? '#F3F4F6',
  color:           map[props.status]?.text ?? '#374151',
}))

const label = computed(() => map[props.status]?.[props.genero === 'f' ? 'f' : 'm'] ?? props.status)
</script>
