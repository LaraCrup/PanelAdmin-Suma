<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="absolute inset-0 bg-black/40" />
        <div
          class="relative bg-white rounded-2xl shadow-lg flex flex-col max-h-[90vh] w-full"
          :class="sizeClass"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 class="font-heading text-lg font-medium text-primary">{{ title }}</h3>
            <button
              class="text-muted hover:text-text transition-colors"
              @click="$emit('close')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 pb-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border flex gap-3 justify-end">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

defineEmits(['close'])

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}[props.size] ?? 'max-w-lg'))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
