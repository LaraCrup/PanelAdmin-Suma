<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClass, variantClass]"
    v-bind="$attrs"
  >
    <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
    <slot />
  </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  variant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const baseClass = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs lg:text-sm font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'

const variantClass = computed(() => ({
  primary:   'bg-accent text-text hover:opacity-90',
  secondary: 'border border-primary text-primary bg-transparent hover:bg-primary/5',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  ghost:     'text-muted hover:text-text hover:bg-black/5',
}[props.variant] ?? 'bg-accent text-text'))
</script>
