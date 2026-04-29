<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <TextField
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="tu@email.com"
      required
    />
    <TextField
      v-model="form.password"
      label="Contraseña"
      type="password"
      placeholder="••••••••"
      required
    />
    <p v-if="errorMsg" class="text-sm text-red-600 text-center">{{ errorMsg }}</p>
    <Button type="submit" :loading="loading" class="w-full mt-2 py-3">
      Ingresar
    </Button>
  </form>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await login(form.email, form.password)
  if (error) errorMsg.value = error.message
  loading.value = false
}
</script>
