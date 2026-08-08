import type { NavigationMenuItem } from '@nuxt/ui'

export const useNavigation = () => {
  const route = useRoute()
  const { t } = useI18n()

  const items = computed<NavigationMenuItem[]>(() => [
    {
      label: t('nav.home'),
      to: '/',
      icon: 'i-lucide-home',
      active: route.path === '/'
    },
    {
      label: t('nav.buy'),
      to: '/buy',
      icon: 'i-lucide-shopping-bag',
      active: route.path.startsWith('/buy')
    },
    {
      label: t('nav.sale'),
      to: '/sale',
      icon: 'i-lucide-coins',
      active: route.path.startsWith('/sale')
    }
  ])

  return {
    items
  }
}
