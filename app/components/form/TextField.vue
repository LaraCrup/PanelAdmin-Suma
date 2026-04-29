<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-semibold text-text">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      v-bind="$attrs"
      class="border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted"
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
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>
