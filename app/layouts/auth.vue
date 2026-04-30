<template>
  <div class="min-h-screen bg-gradient-to-br from-primary to-[#0d5a51] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
      <div class="mb-8 flex flex-col items-center gap-2">
        <img src="/images/isotipo.svg" alt="Suma" class="w12 h12">
        <h1 class="font-heading text-xl font-medium text-terciary">Panel de Administración</h1>
        <p class="text-muted text-sm">Suma</p>
      </div>
      <slot />
    </div>
  </div>
</template>
