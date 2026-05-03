<template>
  <div class="flex items-center justify-between mb-6">
    <h1 class="font-heading text-lg lg:text-2xl font-medium text-primary">{{ title }}</h1>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>
