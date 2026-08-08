import type { NavigationMenuItem } from '@nuxt/ui'

const stripLocalePrefix = (path: string) => path.replace(/^\/(ar|en|fr|es)/, '') || '/'

export const useNavigation = () => {
  const route = useRoute()
  const { t, locale } = useI18n()

  const localePath = (path: string) => `/${locale.value}${path}`

  const items = computed<NavigationMenuItem[]>(() => [
    {
      label: t('nav.home'),
      to: localePath('/'),
      icon: 'i-lucide-home',
      active: stripLocalePrefix(route.path) === '/'
    },
    {
      label: t('nav.buy'),
      to: localePath('/buy'),
      icon: 'i-lucide-shopping-bag',
      active: stripLocalePrefix(route.path).startsWith('/buy')
    },
    {
      label: t('nav.sale'),
      to: localePath('/sale'),
      icon: 'i-lucide-coins',
      active: stripLocalePrefix(route.path).startsWith('/sale')
    }
  ])

  return {
    items
  }
}
