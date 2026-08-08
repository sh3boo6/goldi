<script setup lang="ts">
defineProps<{
  class?: string
  title?: string
  icon?: string
}>()
</script>

<template>
  <h1 :class="['text-2xl font-bold border-b border-accented/20 flex items-center gap-3 p-4', $props.class]">
    <!-- عرض الأيقونة إذا تم تمريرها عبر Prop أو Slot -->
    <slot name="icon">
      <UIcon
        v-if="icon"
        :name="icon"
        class="w-7 h-7 text-primary shrink-0"
      />
    </slot>

    <!-- عرض العنوان الممرّر من خلال Slot الافتراضي أو من خلال Prop -->
    <slot>
      <span>{{ title }}</span>
    </slot>
  </h1>
</template>
