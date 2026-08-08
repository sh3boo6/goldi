import type { NavigationMenuItem } from '@nuxt/ui'

export const useNavigation = () => {
  const route = useRoute()

  const items = computed<NavigationMenuItem[]>(() => [
    {
      label: 'الرئيسية',
      to: '/',
      icon: 'i-lucide-home',
      active: route.path === '/'
    },
    {
      label: 'شراء',
      to: '/buy',
      icon: 'i-lucide-shopping-bag',
      active: route.path.startsWith('/buy')
    },
    {
      label: 'بيع',
      to: '/sale',
      icon: 'i-lucide-coins',
      active: route.path.startsWith('/sale')
    }
  ])

  return {
    items
  }
}
