<script setup lang="ts">

</script>

<template>
  <div class="min-h-screen bg-default flex flex-col">
    <AppHeader />
    <div class="flex-1 pb-24 pt-16">
      <slot />
    </div>
    <AppTabs />
  </div>
</template>
