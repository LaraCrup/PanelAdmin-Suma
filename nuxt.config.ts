export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'es',
      },
      meta: [
        {
          name: 'description',
          content: 'Panel de administración de Suma para la gestión de marcas, beneficios y novedades.',
        },
        {
          name: 'robots',
          content: 'noindex, nofollow',
        },
        {
          name: 'theme-color',
          content: '#157a6e',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
          sizes: '32x32',
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon-cuadrado.svg',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@600;700&family=Quicksand:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
