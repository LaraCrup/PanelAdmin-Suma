<template>
  <div class="w-full">
    <PageHeader title="Nueva marca">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/admin/marcas')">Cancelar</Button>
      </template>
    </PageHeader>

    <div class="bg-white rounded-2xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <TextField v-model="form.name" label="Nombre de la marca" required />
        <ImageUpload v-model="form.image_url" folder="brands" label="Logo" aspect="square" />

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/admin/marcas')">Cancelar</Button>
          <Button type="submit" :loading="loading">Crear marca</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Nueva marca' })

const { createBrand } = useBrand()
const user = useSupabaseUser()

const form = reactive({
  name: '',
  image_url: '',
})

const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await createBrand({ ...form, created_by: user.value?.id })
  if (error) {
    errorMsg.value = error
  } else {
    await navigateTo('/admin/marcas')
  }
  loading.value = false
}
</script>
