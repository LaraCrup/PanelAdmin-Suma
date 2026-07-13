<template>
  <div class="w-full">
    <PageHeader title="Editar beneficio">
      <template #actions>
        <Button variant="secondary" @click="navigateTo(backPath)">Cancelar</Button>
      </template>
    </PageHeader>

    <div v-if="pageLoading" class="flex justify-center py-16">
      <LoadingSpinner size="lg" class="text-primary" />
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
      <div class="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted">
        <span><span class="font-semibold text-text">Marca:</span> {{ brandName }}</span>
        <Badge :status="benefitStatus" />
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.title" label="Título" required />
        <TextareaField v-model="form.description" label="Descripción" :rows="3" required />
        <TextField v-model="form.discount_code" label="Código de descuento" required />
        <TextareaField v-model="form.terms_conditions" label="Términos y condiciones" :rows="3" required />
        <ImageUpload v-model="form.image_url" folder="benefits" label="Imagen" required />
        <DateField v-model="form.valid_until" label="Válido hasta" required />
        <SelectField
          v-if="benefitStatus === 'approved'"
          v-model="form.level"
          label="Nivel"
          :options="levelOptions"
          placeholder="Nivel..."
          required
        />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo(backPath)">Cancelar</Button>
          <Button type="submit" :loading="loading">Guardar cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Editar beneficio' })

const route = useRoute()
const { fetchOneBenefit, adminUpdateBenefit } = useBenefits()
const { levelOptions, fetchLevels } = useLevels()
const { deleteImage } = useImageUpload()

const form = reactive({
  title: '',
  description: '',
  discount_code: '',
  terms_conditions: '',
  image_url: '',
  valid_until: '',
  level: '',
})

const pageLoading = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const benefitStatus = ref('')
const brandName = ref('—')
let originalImageUrl = ''

const backPath = computed(() => {
  if (benefitStatus.value === 'pending') return '/admin/benefits/pendientes'
  if (benefitStatus.value === 'rejected') return '/admin/benefits/rechazados'
  return '/admin/benefits/activos'
})

onMounted(async () => {
  const [{ data, error }] = await Promise.all([fetchOneBenefit(route.params.id), fetchLevels()])

  if (error || !data) {
    await navigateTo('/admin/benefits/activos')
    return
  }

  benefitStatus.value = data.status
  brandName.value = data.brands?.name ?? '—'
  originalImageUrl = data.image_url ?? ''
  Object.assign(form, {
    title: data.title ?? '',
    description: data.description ?? '',
    discount_code: data.discount_code ?? '',
    terms_conditions: data.terms_conditions ?? '',
    image_url: data.image_url ?? '',
    valid_until: data.valid_until ? data.valid_until.split('T')[0] : '',
    level: data.level ?? '',
  })

  pageLoading.value = false
})

async function handleSubmit() {
  if (!form.image_url) {
    errorMsg.value = 'La imagen es obligatoria.'
    return
  }
  loading.value = true
  errorMsg.value = ''

  const payload = {
    title: form.title,
    description: form.description,
    discount_code: form.discount_code,
    terms_conditions: form.terms_conditions,
    image_url: form.image_url,
    valid_until: form.valid_until || null,
  }
  if (benefitStatus.value === 'approved' && form.level) {
    payload.level = form.level
  }

  const { error } = await adminUpdateBenefit(route.params.id, payload)
  if (error) {
    errorMsg.value = error
  } else {
    if (originalImageUrl && form.image_url !== originalImageUrl) {
      await deleteImage(originalImageUrl)
    }
    await navigateTo(backPath.value)
  }
  loading.value = false
}
</script>
