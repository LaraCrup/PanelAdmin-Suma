<template>
  <div>
    <PageHeader title="Mi Marca" />

    <!-- Brand form -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 class="font-heading font-bold text-text mb-4">Información de la marca</h2>
      <form @submit.prevent="handleSaveBrand" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <ImageUpload v-model="brandForm.logo_url" folder="brands" label="Logo" aspect="square" />
        </div>
        <TextField v-model="brandForm.name" label="Nombre" required />
        <TextField v-model="brandForm.website" label="Sitio web" type="url" />
        <div class="md:col-span-2">
          <TextareaField v-model="brandForm.description" label="Descripción" :rows="3" />
        </div>
        <div class="md:col-span-2 flex justify-end gap-3">
          <p v-if="saveError" class="text-sm text-red-500 self-center">{{ saveError }}</p>
          <Button type="submit" :loading="saving">Guardar cambios</Button>
        </div>
      </form>
    </div>

    <!-- Users table — only brand admins -->
    <div v-if="authStore.isBrandAdmin" class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-heading font-bold text-text">Usuarios de la marca</h2>
      </div>
      <DataTable
        :columns="userColumns"
        :rows="brandUsers"
        :loading="loadingUsers"
        emptyMessage="No hay usuarios en esta marca"
      >
        <template #cell-name="{ row }">
          <div>
            <p class="font-semibold text-text">{{ row.profiles?.display_name ?? row.profiles?.name ?? '—' }}</p>
          </div>
        </template>
        <template #cell-role="{ row }">
          <select
            :value="row.role"
            class="border border-border rounded-lg px-2 py-1 text-sm"
            @change="handleRoleChange(row.id, $event.target.value)"
          >
            <option value="admin">Admin</option>
            <option value="member">Miembro</option>
          </select>
        </template>
        <template #cell-actions="{ row }">
          <Button variant="danger" size="sm" @click="confirmRemove(row)">Eliminar</Button>
        </template>
      </DataTable>
    </div>

    <ConfirmModal
      :show="showConfirm"
      title="Eliminar usuario"
      :message="`¿Querés eliminar a ${selectedUser?.profiles?.display_name} de la marca?`"
      confirmLabel="Eliminar"
      variant="danger"
      @confirm="handleRemove"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'brand', title: 'Mi Marca' })

const authStore = useAuthStore()
const { brand, fetchBrand, updateBrand } = useBrand()
const { brandUsers, loading: loadingUsers, fetchBrandUsers, updateUserRole, removeUserFromBrand } = useBrandUsers()

const brandForm = reactive({ name: '', description: '', logo_url: '', website: '' })
const saving = ref(false)
const saveError = ref('')
const showConfirm = ref(false)
const selectedUser = ref(null)

const userColumns = [
  { key: 'name', label: 'Nombre' },
  { key: 'role', label: 'Rol', width: '140px' },
  { key: 'actions', label: '', width: '100px' },
]

onMounted(async () => {
  await fetchBrand(authStore.brandId)
  if (brand.value) Object.assign(brandForm, brand.value)
  if (authStore.isBrandAdmin) await fetchBrandUsers(authStore.brandId)
})

async function handleSaveBrand() {
  saving.value = true
  saveError.value = ''
  const { error } = await updateBrand(authStore.brandId, brandForm)
  if (error) saveError.value = error
  saving.value = false
}

async function handleRoleChange(brandUserId, role) {
  await updateUserRole(brandUserId, role)
}

function confirmRemove(user) {
  selectedUser.value = user
  showConfirm.value = true
}

async function handleRemove() {
  showConfirm.value = false
  await removeUserFromBrand(selectedUser.value.id)
  await fetchBrandUsers(authStore.brandId)
}
</script>
