import type { DropdownMenuItem } from '@nuxt/ui'

export const useExtraPages = () => {
  const route = useRoute()

  const extraPages = computed<DropdownMenuItem[]>(() => [
    {
      label: 'الإعدادات',
      to: '/settings',
      icon: 'i-lucide-settings',
      active: route.path.startsWith('/settings')
    },
    {
      label: 'حول التطبيق',
      to: '/about',
      icon: 'i-lucide-info',
      active: route.path.startsWith('/about')
    }
  ])

  return {
    extraPages
  }
}
