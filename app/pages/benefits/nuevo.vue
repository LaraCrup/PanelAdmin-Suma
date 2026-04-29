<template>
  <div class="max-w-2xl">
    <PageHeader title="Nuevo beneficio">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/benefits')">Cancelar</Button>
      </template>
    </PageHeader>

    <div class="bg-white rounded-2xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.title" label="Título" required />
        <TextareaField v-model="form.description" label="Descripción" :rows="3" />
        <TextField v-model="form.discount" label="Descuento (%)" type="number" min="0" max="100" />
        <ImageUpload v-model="form.image_url" folder="benefits" label="Imagen" />
        <DateField v-model="form.valid_until" label="Válido hasta" :min="today" />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/benefits')">Cancelar</Button>
          <Button type="submit" :loading="loading">Publicar beneficio</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Nuevo beneficio' })

const { createBenefit } = useBenefits()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: '',
  description: '',
  discount: '',
  image_url: '',
  valid_until: '',
})

const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await createBenefit({
    ...form,
    discount: form.discount ? Number(form.discount) : null,
  })
  if (error) {
    errorMsg.value = error
  } else {
    await navigateTo('/benefits')
  }
  loading.value = false
}
</script>
