<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-semibold text-text">{{ label }}</label>

    <div
      v-if="preview"
      class="relative w-full max-h-40 rounded-xl overflow-hidden border border-border"
      :class="aspectClass"
    >
      <img :src="preview" class="w-full max-h-40 h-full object-contain" alt="Imagen seleccionada" />
      <button
        type="button"
        aria-label="Eliminar imagen"
        class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
        @click="removeImage"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <label
      class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary transition-colors"
      :class="{ 'opacity-50 pointer-events-none': uploading }"
    >
      <LoadingSpinner v-if="uploading" />
      <template v-else>
        <svg class="h-8 w-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-sm text-muted">{{ preview ? 'Cambiar imagen' : 'Subir imagen' }}</span>
        <span class="text-xs text-muted">JPG, PNG o WebP · Máx. 2MB</span>
      </template>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        :disabled="uploading"
        @change="handleFile"
      />
    </label>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, required: true },
  label: { type: String, default: '' },
  aspect: { type: String, default: 'video' },
})

const emit = defineEmits(['update:modelValue'])

const { uploadImage, deleteImage } = useImageUpload()

const uploading = ref(false)
const error = ref('')
const preview = ref(props.modelValue || '')
// Guarda la URL original de la DB para no borrarla desde el componente
// (la página de edición se encarga de eso al guardar)
const dbUrl = ref(props.modelValue || '')

watch(() => props.modelValue, (val) => {
  if (val && !preview.value) {
    preview.value = val
    dbUrl.value = val
  }
})

const aspectClass = computed(() => ({
  square: 'aspect-square',
  video:  'aspect-video',
  wide:   'aspect-[3/1]',
}[props.aspect] ?? 'aspect-video'))

function isSessionUpload(url) {
  return url && url !== dbUrl.value
}

async function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return

  error.value = ''
  uploading.value = true

  const { url, error: uploadError } = await uploadImage(file, props.folder)

  if (uploadError) {
    error.value = uploadError
  } else {
    // Si ya había una imagen subida en esta sesión (no la original de la DB), borrarla
    if (isSessionUpload(preview.value)) {
      deleteImage(preview.value)
    }
    preview.value = url
    emit('update:modelValue', url)
  }

  uploading.value = false
  e.target.value = ''
}

function removeImage() {
  // Si la imagen que se está quitando fue subida en esta sesión, borrarla del bucket
  if (isSessionUpload(preview.value)) {
    deleteImage(preview.value)
  }
  preview.value = ''
  emit('update:modelValue', '')
}
</script>
