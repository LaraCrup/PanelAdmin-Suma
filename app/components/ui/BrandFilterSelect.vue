<template>
  <select
    :value="modelValue"
    class="border border-border rounded-xl px-4 py-2 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option value="">Todas las marcas</option>
    <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  brands: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])
</script>
