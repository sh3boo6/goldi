<script setup lang="ts">
const { share, isSupported } = useShare()
const { localePath } = useNavigation()

const startShare = () => {
  share({
    title: 'برنامج الذهب',
    text: 'أفضل تطبيق لمتابعة أسعار الذهب في السعودية',
    url: location.href
  })
}
</script>

<template>
  <div class="h-16 flex items-center justify-between border-b border-b-accented/20 bg-neutral px-8 fixed top-0 left-0 right-0 z-50 backdrop-blur-xs">
    <div class="flex items-center gap-4">
      <ULink
        :to="localePath('/')"
      >
        <img
          src="/img/logo.png"
          alt="Logo"
          height="40"
          width="40"
        >
      </ULink>
    </div>
    <div class="flex items-center gap-4">
      <UButton
        v-if="isSupported"
        color="neutral"
        variant="ghost"
        @click="startShare"
      >
        <UIcon
          name="i-lucide-share-2"
          class="w-5 h-5"
        />
      </UButton>
      <UColorModeButton />
    </div>
  </div>
</template>
