<template>
  <div class="bg-white rounded-2xl shadow-sm p-6">
    <p class="text-sm text-muted mb-1">{{ label }}</p>
    <p class="text-3xl font-bold font-heading" :style="{ color }">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  color: { type: String, default: '#157A6E' },
})
</script>
