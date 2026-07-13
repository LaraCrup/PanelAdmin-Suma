<template>
  <ul class="flex flex-col gap-1">
    <li
      v-for="rule in rules"
      :key="rule.label"
      class="flex items-center gap-1.5 text-xs"
      :class="rule.passes ? 'text-green-600' : 'text-muted'"
    >
      <span class="text-base leading-none">{{ rule.passes ? '✓' : '·' }}</span>
      {{ rule.label }}
    </li>
  </ul>
</template>

<script setup>
defineProps({
  rules: { type: Array, required: true },
})
</script>
