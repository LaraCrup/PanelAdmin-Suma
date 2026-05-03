<template>
  <!-- Overlay (mobile only) -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/40 z-30 desktop:hidden"
    @click="$emit('close')"
  />

  <aside
    :class="[
      'w-60 h-screen bg-primary fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 ease-in-out',
      open ? 'translate-x-0' : '-translate-x-full desktop:translate-x-0',
    ]"
  >

    <!-- Header -->
    <div class="p-5 border-b border-white/20 flex items-center justify-between gap-3">
      <template v-if="authStore.isSuperAdmin">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <img src="/images/isotipo.svg" alt="SUMA" class="h-5 w-5" />
          </div>
          <p class="text-white font-heading font-medium text-sm">SUMA Admin</p>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center gap-3">
          <img
            v-if="authStore.brand?.image_url"
            :src="authStore.brand.image_url"
            class="h-8 w-8 rounded-lg object-cover flex-shrink-0"
            alt="logo"
          />
          <div
            v-else
            class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <span class="text-white font-medium text-sm">{{ brandInitial }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-white font-heading font-bold text-sm leading-tight truncate">
              {{ authStore.brand?.name ?? 'Mi Marca' }}
            </p>
            <p class="text-white/50 text-xs">powered by Suma</p>
          </div>
        </div>
      </template>

      <button
        class="desktop:hidden flex-shrink-0 text-white/60 hover:text-white transition-colors"
        @click="$emit('close')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">

      <!-- Brand user nav -->
      <template v-if="!authStore.isSuperAdmin">
        <NuxtLink to="/marca" :class="linkClass('/marca')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Marca
        </NuxtLink>
        <NuxtLink to="/news" :class="linkClass('/news')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Novedades
        </NuxtLink>
        <NuxtLink to="/benefits" :class="linkClass('/benefits')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Beneficios
        </NuxtLink>
      </template>

      <!-- Superadmin nav -->
      <template v-else>
        <p class="text-white/40 text-xs font-semibold uppercase tracking-wide px-3 pt-2 pb-1">Novedades</p>
        <NuxtLink to="/admin/news/pendientes" :class="linkClass('/admin/news/pendientes')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pendientes
        </NuxtLink>
        <NuxtLink to="/admin/news/activas" :class="linkClass('/admin/news/activas')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Activas
        </NuxtLink>
        <NuxtLink to="/admin/news/rechazadas" :class="linkClass('/admin/news/rechazadas')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Rechazadas
        </NuxtLink>

        <p class="text-white/40 text-xs font-semibold uppercase tracking-wide px-3 pt-4 pb-1">Beneficios</p>
        <NuxtLink to="/admin/benefits/pendientes" :class="linkClass('/admin/benefits/pendientes')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pendientes
        </NuxtLink>
        <NuxtLink to="/admin/benefits/activos" :class="linkClass('/admin/benefits/activos')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Activos
        </NuxtLink>
        <NuxtLink to="/admin/benefits/rechazados" :class="linkClass('/admin/benefits/rechazados')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Rechazados
        </NuxtLink>

        <p class="text-white/40 text-xs font-semibold uppercase tracking-wide px-3 pt-4 pb-1">Gestión</p>
        <NuxtLink to="/admin/usuarios" :class="linkClass('/admin/usuarios')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Usuarios
        </NuxtLink>
        <NuxtLink to="/admin/marcas" :class="linkClass('/admin/marcas')">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Marcas
        </NuxtLink>
      </template>
    </nav>

    <!-- Logout -->
    <div class="p-4 border-t border-white/20">
      <button
        class="w-full text-left flex items-center gap-2 text-white/70 hover:text-white text-sm rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
        @click="handleLogout"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const { logout } = useAuth()
const route = useRoute()

const brandInitial = computed(() => authStore.brand?.name?.[0]?.toUpperCase() ?? 'M')

function linkClass(path) {
  const active = route.path === path || route.path.startsWith(path + '/')
  return [
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
    active
      ? 'bg-accent text-text'
      : 'text-white/80 hover:text-white hover:bg-white/10',
  ].join(' ')
}

watch(() => route.path, () => {
  emit('close')
})

async function handleLogout() {
  await logout()
}
</script>
