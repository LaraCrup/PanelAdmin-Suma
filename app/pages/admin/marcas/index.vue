<template>
  <div>
    <PageHeader title="Marcas">
      <template #actions>
        <Button @click="navigateTo('/admin/marcas/nueva')">+ Nueva marca</Button>
      </template>
    </PageHeader>

    <p v-if="errorMsg" class="text-sm text-red-500 mb-4">{{ errorMsg }}</p>

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
          class="h-16 w-16 rounded-lg object-contain"
        />
        <div
          v-else
          class="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <span class="text-primary text-sm font-bold">{{ row.name?.[0]?.toUpperCase() }}</span>
        </div>
      </template>
      <template #cell-website="{ row }">
        <a v-if="row.website" :href="row.website" target="_blank" rel="noopener noreferrer" class="text-primary text-sm underline truncate block">{{ row.website }}</a>
        <span v-else class="text-muted">—</span>
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
      :message="confirmMessage"
      confirmLabel="Eliminar todo"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['role'], requiredRole: 'superadmin', title: 'Marcas' })

const supabase = useSupabaseClient()
const { fetchBrandImpact, deleteBrand } = useBrand()

const brandsList = ref([])
const loading = ref(false)
const deleting = ref(false)
const showConfirm = ref(false)
const selectedBrand = ref(null)
const impact = ref(null)
const errorMsg = ref('')

const confirmMessage = computed(() => {
  const nombre = selectedBrand.value?.name ?? ''
  if (!impact.value) return `¿Eliminás la marca "${nombre}"? Esta acción no se puede deshacer.`

  const partes = []
  if (impact.value.news) partes.push(`${impact.value.news} novedad${impact.value.news === 1 ? '' : 'es'}`)
  if (impact.value.benefits) partes.push(`${impact.value.benefits} beneficio${impact.value.benefits === 1 ? '' : 's'}`)
  if (impact.value.users) partes.push(`${impact.value.users} usuario${impact.value.users === 1 ? '' : 's'}`)

  if (!partes.length) return `¿Eliminás la marca "${nombre}"? Esta acción no se puede deshacer.`

  return `Al eliminar la marca "${nombre}" también se borran ${partes.join(', ')}, junto con sus imágenes. Esta acción no se puede deshacer.`
})

const columns = [
  { key: 'image_url', label: '', width: '100px' },
  { key: 'name', label: 'Nombre' },
  { key: 'website', label: 'Sitio web' },
  { key: 'created_at', label: 'Creada', width: '140px' },
  { key: 'actions', label: '', width: '180px' },
]

async function fetchBrands() {
  loading.value = true
  const { data } = await supabase
    .from('brands')
    .select('id, name, image_url, website, created_at')
    .order('name')
  brandsList.value = data ?? []
  loading.value = false
}

async function confirmDelete(brand) {
  selectedBrand.value = brand
  impact.value = null
  errorMsg.value = ''
  showConfirm.value = true
  impact.value = await fetchBrandImpact(brand.id)
}

async function handleDelete() {
  if (deleting.value) return
  showConfirm.value = false
  deleting.value = true
  errorMsg.value = ''
  const { error } = await deleteBrand(selectedBrand.value.id)
  if (error) errorMsg.value = `No se pudo eliminar la marca: ${error}`
  deleting.value = false
  await fetchBrands()
}

onMounted(fetchBrands)
</script>
