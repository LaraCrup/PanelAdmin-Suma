<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-semibold text-text">{{ label }}</label>
    <input
      type="date"
      :value="modelValue"
      :min="min"
      :max="max"
      v-bind="$attrs"
      class="border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>
