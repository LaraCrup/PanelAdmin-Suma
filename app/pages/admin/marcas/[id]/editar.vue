<template>
  <div class="w-full">
    <PageHeader title="Editar marca">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/admin/marcas')">Cancelar</Button>
      </template>
    </PageHeader>

    <div v-if="pageLoading" class="flex justify-center py-16">
      <LoadingSpinner size="lg" class="text-primary" />
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.name" label="Nombre de la marca" required />
        <TextField v-model="form.website" label="Sitio web" type="url" placeholder="https://" />
        <ImageUpload v-model="form.image_url" folder="brands" label="Logo" aspect="square" />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/admin/marcas')">Cancelar</Button>
          <Button type="submit" :loading="loading">Guardar cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Editar marca' })

const route = useRoute()
const { fetchBrand, updateBrand, brand } = useBrand()
const { deleteImage } = useImageUpload()

const form = reactive({
  name: '',
  website: '',
  image_url: '',
})

const pageLoading = ref(true)
const loading = ref(false)
const errorMsg = ref('')
let originalImageUrl = ''

onMounted(async () => {
  await fetchBrand(route.params.id)
  if (!brand.value) {
    await navigateTo('/admin/marcas')
    return
  }
  originalImageUrl = brand.value.image_url ?? ''
  form.name = brand.value.name ?? ''
  form.website = brand.value.website ?? ''
  form.image_url = brand.value.image_url ?? ''
  pageLoading.value = false
})

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await updateBrand(route.params.id, form)
  if (error) {
    errorMsg.value = error
  } else {
    if (originalImageUrl && form.image_url !== originalImageUrl) {
      await deleteImage(originalImageUrl)
    }
    await navigateTo('/admin/marcas')
  }
  loading.value = false
}
</script>
