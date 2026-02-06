// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'Upsell Funnel Builder',
      meta: [
        {
          name: 'description',
          content:
            'Build and visualize your sales funnels with upsells and downsells'
        }
      ]
    }
  },

  ssr: false,

  css: ['~/assets/css/main.css'],

  typescript: {
    typeCheck: true
  },

  fonts: {
    families: [
      {
        name: 'Inter',
        weights: [400, 600],
        provider: 'google'
      }
    ]
  }
})
