<template>
  <div class="flex h-screen overflow-hidden bg-bg">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="desktop:ml-60 flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="bg-white border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center">
          <button
            class="desktop:hidden mr-3 p-1 rounded-lg text-terciary"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p class="font-heading font-medium text-terciary text-md lg:text-lg">
            Panel de administración Suma
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-text leading-tight">
              {{ authStore.profile?.display_name || authStore.profile?.name || authStore.user?.email || '' }}
            </p>
            <p class="text-xs text-muted leading-tight">
              {{ authStore.isSuperAdmin ? 'Superadmin' : authStore.isBrandAdmin ? 'Admin' : 'Miembro' }}
            </p>
          </div>
          <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span class="text-accent text-sm font-bold">
              {{ userInitial }}
            </span>
          </div>
        </div>
      </header>

      <!-- Main scrollable area -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const { initAuth } = useAuth()

const sidebarOpen = ref(false)

const userInitial = computed(() => {
  const name = authStore.profile?.display_name || authStore.profile?.name || authStore.user?.email || ''
  return name[0]?.toUpperCase() ?? '?'
})

onMounted(async () => {
  if (!authStore.profile) {
    await initAuth()
  }
})
</script>
