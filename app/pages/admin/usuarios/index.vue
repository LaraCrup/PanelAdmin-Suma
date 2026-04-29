<template>
  <div>
    <PageHeader title="Usuarios">
      <template #actions>
        <Button @click="navigateTo('/admin/usuarios/nuevo')">+ Nuevo usuario</Button>
      </template>
    </PageHeader>

    <div class="flex gap-3 mb-6">
      <BrandFilterSelect v-model="filterBrand" :brands="brands" />
    </div>

    <DataTable
      :columns="columns"
      :rows="filteredUsers"
      :loading="loading"
      emptyMessage="No hay usuarios"
    >
      <template #cell-name="{ row }">
        <div>
          <p class="font-semibold text-text">{{ row.name || '—' }}</p>
          <p class="text-xs text-muted">{{ row.email }}</p>
        </div>
      </template>
      <template #cell-brand="{ row }">
        {{ row.brands?.name ?? '—' }}
      </template>
      <template #cell-role="{ row }">
        <span class="capitalize">{{ row.role === 'admin' ? 'Administrador' : 'Miembro' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <Button variant="danger" @click="confirmRemove(row)">Eliminar</Button>
      </template>
    </DataTable>

    <ConfirmModal
      :show="showConfirm"
      title="Eliminar usuario"
      :message="`¿Eliminás a ${selectedUser?.name ?? selectedUser?.email} de la plataforma?`"
      confirmLabel="Eliminar"
      variant="danger"
      @confirm="handleRemove"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Usuarios' })

const supabase = useSupabaseClient()
const { fetchAllBrands } = useBrand()

const allUsers = ref([])
const loading = ref(false)
const brands = ref([])
const filterBrand = ref('')
const showConfirm = ref(false)
const selectedUser = ref(null)

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'brand', label: 'Marca', width: '160px' },
  { key: 'role', label: 'Rol', width: '140px' },
  { key: 'actions', label: '', width: '100px' },
]

const filteredUsers = computed(() =>
  filterBrand.value
    ? allUsers.value.filter(u => u.brand_id === filterBrand.value)
    : allUsers.value
)

async function fetchUsers() {
  loading.value = true
  const { data } = await supabase
    .from('brand_users')
    .select('id, user_id, role, brand_id, name, email, brands(name)')
    .order('brand_id')
  allUsers.value = data ?? []
  loading.value = false
}

function confirmRemove(user) {
  selectedUser.value = user
  showConfirm.value = true
}

async function handleRemove() {
  showConfirm.value = false
  await $fetch('/api/delete-user', {
    method: 'DELETE',
    body: { userId: selectedUser.value.user_id, brandUserId: selectedUser.value.id },
  })
  await fetchUsers()
}

onMounted(async () => {
  brands.value = await fetchAllBrands()
  await fetchUsers()
})
</script>
