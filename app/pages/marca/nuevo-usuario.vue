<template>
  <div class="w-full">
    <PageHeader title="Nuevo usuario">
      <template #actions>
        <Button variant="secondary" @click="navigateTo('/marca')">Cancelar</Button>
      </template>
    </PageHeader>

    <div class="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
          <TextField v-model="form.name" label="Nombre completo" required />
          <TextField v-model="form.email" label="Email" type="email" required />
        </div>
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <TextField v-model="form.password" label="Contraseña" type="password" required />
            <PasswordChecklist :rules="passwordRules" />
          </div>
          <SelectField
            v-model="form.brandRole"
            label="Rol"
            :options="[{ value: 'admin', label: 'Administrador' }, { value: 'member', label: 'Miembro' }]"
          />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" @click="navigateTo('/marca')">Cancelar</Button>
          <Button type="submit" :loading="loading">Crear usuario</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', requiredBrandRole: 'admin', title: 'Nuevo usuario' })

const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  brandRole: 'admin',
})

const loading = ref(false)
const errorMsg = ref('')

const { passwordRules, passwordValid } = usePasswordValidation(computed(() => form.password))

async function handleSubmit() {
  if (!passwordValid.value) {
    errorMsg.value = 'La contraseña no cumple los requisitos.'
    return
  }
  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/create-user', {
      method: 'POST',
      body: { ...form, brandId: authStore.brandId },
    })
    await navigateTo('/marca')
  } catch (err) {
    errorMsg.value = err.data?.message ?? 'Error al crear el usuario.'
  }
  loading.value = false
}
</script>
