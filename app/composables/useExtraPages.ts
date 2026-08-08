import type { DropdownMenuItem } from '@nuxt/ui'

export const useExtraPages = () => {
  const route = useRoute()
  const { t } = useI18n()

  const extraPages = computed<DropdownMenuItem[]>(() => [
    {
      label: t('nav.zakah'),
      to: '/zakah',
      icon: 'i-lucide-scroll-text',
      active: route.path.startsWith('/zakah')
    },
    {
      label: t('nav.settings'),
      to: '/settings',
      icon: 'i-lucide-settings',
      active: route.path.startsWith('/settings')
    },
    {
      label: t('nav.about'),
      to: '/about',
      icon: 'i-lucide-info',
      active: route.path.startsWith('/about')
    }
  ])

  return {
    extraPages
  }
}
