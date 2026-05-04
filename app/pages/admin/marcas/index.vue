<template>
  <div>
    <PageHeader title="Marcas">
      <template #actions>
        <Button @click="navigateTo('/admin/marcas/nueva')">+ Nueva marca</Button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="brandsList"
      :loading="loading"
      emptyMessage="No hay marcas registradas"
    >
      <template #cell-image_url="{ row }">
        <img
          v-if="row.image_url"
          :src="row.image_url"
          :alt="row.name"
          class="h-16 w-16 rounded-lg object-coontain"
        />
        <div
          v-else
          class="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <span class="text-primary text-sm font-bold">{{ row.name?.[0]?.toUpperCase() }}</span>
        </div>
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" @click="navigateTo(`/admin/marcas/${row.id}/editar`)">Editar</Button>
          <Button variant="danger" @click="confirmDelete(row)">Eliminar</Button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      :show="showConfirm"
      title="Eliminar marca"
      :message="`¿Eliminás la marca &quot;${selectedBrand?.name}&quot;? Esta acción no se puede deshacer.`"
      confirmLabel="Eliminar"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />

    <Modal :show="showDeleteError" title="No se puede eliminar" @close="showDeleteError = false">
      <p class="text-sm text-text">
        La marca <span class="font-semibold">{{ selectedBrand?.name }}</span> tiene novedades o beneficios asociados.
        Eliminá primero ese contenido antes de borrar la marca.
      </p>
      <template #footer>
        <Button @click="showDeleteError = false">Entendido</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Marcas' })

const supabase = useSupabaseClient()
const { deleteBrand } = useBrand()

const brandsList = ref([])
const loading = ref(false)
const showConfirm = ref(false)
const showDeleteError = ref(false)
const selectedBrand = ref(null)

const columns = [
  { key: 'image_url', label: '', width: '100px' },
  { key: 'name', label: 'Nombre' },
  { key: 'created_at', label: 'Creada', width: '140px' },
  { key: 'actions', label: '', width: '180px' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchBrands() {
  loading.value = true
  const { data } = await supabase
    .from('brands')
    .select('id, name, image_url, created_at')
    .order('name')
  brandsList.value = data ?? []
  loading.value = false
}

function confirmDelete(brand) {
  selectedBrand.value = brand
  showConfirm.value = true
}

async function handleDelete() {
  showConfirm.value = false
  const { error } = await deleteBrand(selectedBrand.value.id)
  if (error) {
    showDeleteError.value = true
    return
  }
  await fetchBrands()
}

onMounted(fetchBrands)
</script>
