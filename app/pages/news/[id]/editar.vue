<template>
  <div class="max-w-2xl">
    <PageHeader title="Editar novedad">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/news')">Cancelar</Button>
      </template>
    </PageHeader>

    <div v-if="pageLoading" class="flex justify-center py-16">
      <LoadingSpinner size="lg" class="text-primary" />
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.title" label="Título" required />
        <SelectField
          v-model="form.category_id"
          label="Categoría"
          :options="categoryOptions"
          placeholder="Seleccioná una categoría"
        />
        <TextareaField v-model="form.content" label="Contenido" :rows="6" required />
        <ImageUpload v-model="form.image_url" folder="news" label="Imagen" />
        <DateField v-model="form.published_at" label="Fecha de publicación" />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/news')">Cancelar</Button>
          <Button type="submit" :loading="loading">Guardar cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Editar novedad' })

const route = useRoute()
const { fetchOneNews, updateNews, fetchCategories } = useNews()

const form = reactive({
  title: '',
  category_id: '',
  content: '',
  image_url: '',
  published_at: '',
})

const pageLoading = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const categories = ref([])
const categoryOptions = computed(() => categories.value.map(c => ({ value: c.id, label: c.name })))

onMounted(async () => {
  const [{ data, error }, cats] = await Promise.all([
    fetchOneNews(route.params.id),
    fetchCategories(),
  ])

  if (error || !data) {
    await navigateTo('/news')
    return
  }

  if (data.status !== 'pending') {
    await navigateTo('/news')
    return
  }

  categories.value = cats
  Object.assign(form, {
    title: data.title ?? '',
    category_id: data.category_id ?? '',
    content: data.content ?? '',
    image_url: data.image_url ?? '',
    published_at: data.published_at ? data.published_at.split('T')[0] : '',
  })

  pageLoading.value = false
})

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await updateNews(route.params.id, form)
  if (error) {
    errorMsg.value = error
  } else {
    await navigateTo('/news')
  }
  loading.value = false
}
</script>
