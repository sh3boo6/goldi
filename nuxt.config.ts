// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/fonts', '@vueuse/nuxt', '@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/i18n'],
  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag === 'environment_details'
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    preset: 'vercel'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      {
        name: 'IBM Plex Sans Arabic',
        provider: 'google',
        global: true,
        weights: ['400', '500', '600', '700'],
        styles: ['normal']
      },
      {
        name: 'Inter',
        provider: 'google',
        global: true,
        weights: ['400', '500', '600', '700'],
        styles: ['normal']
      }
    ]
  },

  i18n: {
    locales: [
      { code: 'ar', iso: 'ar-SA', name: 'العربية', files: ['ar.json'] },
      { code: 'en', iso: 'en-US', name: 'English', files: ['en.json'] },
      { code: 'fr', iso: 'fr-FR', name: 'Français', files: ['fr.json'] },
      { code: 'es', iso: 'es-ES', name: 'Español', files: ['es.json'] }
    ],
    defaultLocale: 'ar',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'ar'
    }
  },

  pwa: {
    manifest: {
      name: 'برنامج الذهب',
      short_name: 'GoldCalc',
      description: 'حاسبة تقييم أسعار الذهب',
      start_url: '/',
      scope: '/',
      theme_color: '#f59e0b',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'img/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'img/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'img/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  }
})
