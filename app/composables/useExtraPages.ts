import type { DropdownMenuItem } from '@nuxt/ui'

const stripLocalePrefix = (path: string) => path.replace(/^\/(ar|en|fr|es)/, '') || '/'

export const useExtraPages = () => {
  const route = useRoute()
  const { t } = useI18n()

  const extraPages = computed<DropdownMenuItem[]>(() => [
    {
      label: t('nav.zakah'),
      to: '/zakah',
      icon: 'i-lucide-scroll-text',
      active: stripLocalePrefix(route.path).startsWith('/zakah')
    },
    {
      label: t('nav.settings'),
      to: '/settings',
      icon: 'i-lucide-settings',
      active: stripLocalePrefix(route.path).startsWith('/settings')
    },
    {
      label: t('nav.about'),
      to: '/about',
      icon: 'i-lucide-info',
      active: stripLocalePrefix(route.path).startsWith('/about')
    }
  ])

  return {
    extraPages
  }
}
