<template>
  <div class="flex gap-2 mb-6 flex-wrap">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="[
        'px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
        modelValue === tab.value
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-muted border-border hover:border-primary hover:text-primary',
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span
        v-if="counts && counts[tab.value] !== undefined"
        class="ml-1.5 text-xs"
        :class="modelValue === tab.value ? 'opacity-80' : 'text-muted'"
      >
        ({{ counts[tab.value] }})
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  counts: { type: Object, default: null },
})

defineEmits(['update:modelValue'])

const tabs = [
  { value: '',         label: 'Todas' },
  { value: 'pending',  label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
]
</script>
