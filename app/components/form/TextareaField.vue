<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-semibold text-text">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :required="required"
      v-bind="$attrs"
      class="border border-border rounded-xl px-4 py-2 text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted"
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
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>
