<template>
  <div class="min-h-screen bg-gradient-to-br from-primary to-[#0d5a51] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
      <div class="mb-8 text-center">
        <div class="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span class="text-accent font-heading font-bold text-2xl">S</span>
        </div>
        <h1 class="font-heading text-xl font-bold text-text">Panel de Administración</h1>
        <p class="text-muted text-sm mt-1">SUMA</p>
      </div>
      <slot />
    </div>
  </div>
</template>
