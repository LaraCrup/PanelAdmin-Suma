<template>
  <div class="max-w-2xl">
    <PageHeader title="Nueva novedad">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/news')">Cancelar</Button>
      </template>
    </PageHeader>

    <div class="bg-white rounded-2xl shadow-sm p-6">
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
          <Button type="submit" :loading="loading">Publicar novedad</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Nueva novedad' })

const { createNews, fetchCategories } = useNews()

const form = reactive({
  title: '',
  category_id: '',
  content: '',
  image_url: '',
  published_at: '',
})

const loading = ref(false)
const errorMsg = ref('')
const categories = ref([])
const categoryOptions = computed(() => categories.value.map(c => ({ value: c.id, label: c.name })))

onMounted(async () => {
  categories.value = await fetchCategories()
})

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await createNews(form)
  if (error) {
    errorMsg.value = error
  } else {
    await navigateTo('/news')
  }
  loading.value = false
}
</script>
