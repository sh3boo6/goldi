<script setup>
const { locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' }
  ],
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => isRtl.value ? 'rtl' : 'ltr')
  }
})

useSeoMeta({})
</script>

<template>
  <UApp :dir="isRtl ? 'rtl' : 'ltr'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
