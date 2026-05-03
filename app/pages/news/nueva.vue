<template>
  <div class="w-full">
    <PageHeader title="Nueva novedad">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/news')">Cancelar</Button>
      </template>
    </PageHeader>

    <div class="bg-white rounded-2xl shadow-sm lg:p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.title" label="Título" required />
        <TextareaField v-model="form.content" label="Contenido" :rows="14" required />
        <ImageUpload v-model="form.image_url" folder="news" label="Imagen" />
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">          
          <SelectField
            v-model="form.category_id"
            label="Categoría"
            :options="categoryOptions"
            placeholder="Seleccioná una categoría"
          />
          <DateField v-model="form.publication_date" label="Fecha de publicación" :max="today" />
        </div>

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
  publication_date: '',
})

const today = new Date().toISOString().split('T')[0]
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
