<script setup lang="ts">
const router = useRouter()
const { markIntroAsShown, isIntroVisible } = useIntro()

onMounted(() => {
  if (!isIntroVisible.value) {
    setTimeout(() => {
      markIntroAsShown()
      router.replace('/')
    }, 3000)
  }
})
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-default">
    <img
      src="/img/logo.png"
      :alt="$t('intro.alt')"
      class="w-32 h-32 mb-6 animate-pulse"
    >
    <h1 class="text-3xl font-black text-amber-500">
      {{ $t('app.goldCalculator') }}
    </h1>
    <p class="text-muted text-sm mt-2">
      {{ $t('app.languageName') }}
    </p>
  </div>
</template>
