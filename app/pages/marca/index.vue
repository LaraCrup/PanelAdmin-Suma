<template>
  <div>
    <PageHeader title="Mi Marca" />

    <!-- Brand display -->
    <div class="bg-white rounded-2xl shadow-sm p-2 lg:p-6 mb-6">
      <div class="flex items-center gap-4">
        <img
          v-if="brand?.image_url"
          :src="brand.image_url"
          class="h-20 w-20 rounded-xl object-contain flex-shrink-0"
          alt="logo"
        />
        <div
          v-else
          class="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
        >
          <span class="text-primary font-bold text-2xl">{{ brand?.name?.[0]?.toUpperCase() ?? 'M' }}</span>
        </div>
        <h2 class="font-heading font-medium text-text text-xl">{{ brand?.name }}</h2>
      </div>
    </div>

    <!-- Users table -->
    <div class="bg-white rounded-2xl shadow-sm lg>:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-heading font-medium text-text">Usuarios de la marca</h2>
        <Button v-if="authStore.isBrandAdmin" size="sm" @click="navigateTo('/marca/nuevo-usuario')">
          + Nuevo usuario
        </Button>
      </div>
      <DataTable
        :columns="userColumns"
        :rows="brandUsers"
        :loading="loadingUsers"
        emptyMessage="No hay usuarios en esta marca"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-text">{{ row.name || '—' }}</p>
            <span v-if="row.user_id === authStore.user?.id" class="text-xs text-muted bg-bg border border-border rounded-full px-2 py-0.5">Vos</span>
          </div>
          <p class="text-xs text-muted">{{ row.email ?? '' }}</p>
        </template>
        <template #cell-role="{ row }">
          <span v-if="row.user_id === authStore.user?.id" class="text-sm text-text">
            {{ row.role === 'admin' ? 'Admin' : 'Miembro' }}
          </span>
          <select
            v-else-if="authStore.isBrandAdmin"
            :value="row.role"
            class="border border-border rounded-lg px-2 py-1 text-sm"
            @change="handleRoleChange(row.id, $event.target.value)"
          >
            <option value="admin">Admin</option>
            <option value="member">Miembro</option>
          </select>
          <span v-else class="text-sm text-text">
            {{ row.role === 'admin' ? 'Admin' : 'Miembro' }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <Button
            v-if="authStore.isBrandAdmin && row.user_id !== authStore.user?.id"
            variant="danger"
            size="sm"
            @click="confirmRemove(row)"
          >
            Eliminar
          </Button>
        </template>
      </DataTable>
    </div>

    <ConfirmModal
      :show="showConfirm"
      title="Eliminar usuario"
      :message="`¿Querés eliminar a ${selectedUser?.name} de la marca? Esta acción no se puede deshacer.`"
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
const { brand, fetchBrand } = useBrand()
const { brandUsers, loading: loadingUsers, fetchBrandUsers, updateUserRole, removeUserFromBrand } = useBrandUsers()

const showConfirm = ref(false)
const selectedUser = ref(null)

const userColumns = [
  { key: 'name',    label: 'Nombre' },
  { key: 'role',    label: 'Rol',    width: '140px' },
  { key: 'actions', label: '',       width: '100px' },
]

onMounted(async () => {
  await fetchBrand(authStore.brandId)
  await fetchBrandUsers(authStore.brandId)
})

async function handleRoleChange(brandUserId, role) {
  await updateUserRole(brandUserId, role)
}

function confirmRemove(user) {
  selectedUser.value = user
  showConfirm.value = true
}

async function handleRemove() {
  showConfirm.value = false
  await removeUserFromBrand(selectedUser.value.id, selectedUser.value.user_id)
  await fetchBrandUsers(authStore.brandId)
}
</script>
