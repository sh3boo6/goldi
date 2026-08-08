<script setup lang="ts">
const { items } = useNavigation()
const { extraPages } = useExtraPages()
</script>

<template>
  <div class="h-18 flex items-center justify-around mx-4 mb-4 rounded-4xl bg-neutral border border-accented lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur shadow-lg">
    <template
      v-for="item in items"
      :key="item.label"
    >
      <NuxtLink
        :to="item.to"
        class="p-5 flex flex-col items-center justify-center rounded-2xl text-sm font-medium"
        :class="{
          'text-primary': item.active,
          'text-accented hover:bg-accented/10': !item.active
        }"
      >
        <UIcon
          v-if="item.icon"
          :name="item.icon"
          class="w-6 h-6"
        />
        <span class="text-xs mt-1">
          {{ item.label }}
        </span>
      </NuxtLink>
    </template>
    <UDropdownMenu
      :items="extraPages"
      :content="{
        align: 'start',
        side: 'top',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-40'
      }"
    >
      <UButton
        variant="ghost"
      >
        <div class="flex flex-col items-center justify-center">
          <UIcon
            name="i-lucide-plus"
            class="w-6 h-6 text-default"
          />
          <span class="text-xs mt-1 text-default">المزيد</span>
        </div>
      </UButton>
    </UDropdownMenu>
  </div>
</template>
