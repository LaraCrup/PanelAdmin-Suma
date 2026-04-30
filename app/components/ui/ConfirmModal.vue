<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('cancel')"
      >
        <div class="absolute inset-0 bg-black/40" />
        <div class="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h3 class="font-heading text-lg font-medium text-primary mb-2">{{ title }}</h3>
          <p class="text-sm text-muted mb-6">{{ message }}</p>
          <div class="flex gap-3 justify-end">
            <Button variant="secondary" @click="$emit('cancel')">Cancelar</Button>
            <Button :variant="variant" @click="$emit('confirm')">{{ confirmLabel }}</Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show:         { type: Boolean, required: true },
  title:        { type: String,  default: '¿Confirmar acción?' },
  message:      { type: String,  default: '¿Estás seguro de que querés continuar?' },
  confirmLabel: { type: String,  default: 'Confirmar' },
  variant:      { type: String,  default: 'danger' },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
