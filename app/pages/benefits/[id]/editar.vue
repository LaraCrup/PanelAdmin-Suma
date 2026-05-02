<template>
  <div class="w-full">
    <PageHeader title="Editar beneficio">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/benefits')">Cancelar</Button>
      </template>
    </PageHeader>

    <div v-if="pageLoading" class="flex justify-center py-16">
      <LoadingSpinner size="lg" class="text-primary" />
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.title" label="Título" required />
        <TextareaField v-model="form.description" label="Descripción" :rows="3" required />
        <TextField v-model="form.discount_code" label="Código de descuento" required />
        <TextareaField v-model="form.terms_conditions" label="Términos y condiciones" :rows="3" required />
        <ImageUpload v-model="form.image_url" folder="benefits" label="Imagen" required />
        <DateField v-model="form.valid_until" label="Válido hasta" :min="tomorrow" required />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/benefits')">Cancelar</Button>
          <Button type="submit" :loading="loading">Guardar cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Editar beneficio' })

const route = useRoute()
const { fetchOneBenefit, updateBenefit } = useBenefits()

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const form = reactive({
  title: '',
  description: '',
  discount_code: '',
  terms_conditions: '',
  image_url: '',
  valid_until: '',
})

const pageLoading = ref(true)
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const { data, error } = await fetchOneBenefit(route.params.id)

  if (error || !data || data.status !== 'pending') {
    await navigateTo('/benefits')
    return
  }

  Object.assign(form, {
    title: data.title ?? '',
    description: data.description ?? '',
    discount_code: data.discount_code ?? '',
    terms_conditions: data.terms_conditions ?? '',
    image_url: data.image_url ?? '',
    valid_until: data.valid_until ? data.valid_until.split('T')[0] : '',
  })

  pageLoading.value = false
})

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await updateBenefit(route.params.id, {
    ...form,
    valid_until: form.valid_until || null,
  })
  if (error) {
    errorMsg.value = error
  } else {
    await navigateTo('/benefits')
  }
  loading.value = false
}
</script>
