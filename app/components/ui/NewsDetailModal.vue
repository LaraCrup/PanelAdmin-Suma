<template>
  <Modal :show="show" title="Detalle de novedad" size="lg" @close="$emit('close')">
    <div v-if="loading" class="flex justify-center py-8">
      <LoadingSpinner size="lg" class="text-primary" />
    </div>
    <div v-else-if="item" class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-4 text-sm text-muted">
        <span v-if="showBrand"><span class="font-semibold text-text">Marca:</span> {{ item.brands?.name ?? '—' }}</span>
        <span><span class="font-semibold text-text">Categoría:</span> {{ item.news_categories?.name ?? '—' }}</span>
        <span><span class="font-semibold text-text">Fecha:</span> {{ formatDate(item.created_at) }}</span>
      </div>
      <h2 class="font-heading text-xl font-bold text-text">{{ item.title }}</h2>
      <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="rounded-xl w-full object-cover max-h-64" />
      <p class="text-text whitespace-pre-wrap leading-relaxed">{{ item.content }}</p>
      <div v-if="item.rejection_reason" class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
        <p class="text-xs font-semibold text-red-500 mb-1">Motivo de rechazo</p>
        <p class="text-sm text-red-700 whitespace-pre-wrap">{{ item.rejection_reason }}</p>
      </div>
    </div>
  </Modal>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  loading: { type: Boolean, default: false },
  item: { type: Object, default: null },
  showBrand: { type: Boolean, default: true },
})

defineEmits(['close'])
</script>
