<script setup lang="ts">
import { storeToRefs } from 'pinia'

const online = useOnline()
const ratesStore = useRatesStore()
const { hasShownIntro } = useIntro()
const { t } = useI18n()

onMounted(() => {
  if (!hasShownIntro.value) {
    navigateTo('/intro')
  }
})

const {
  goldGram24SAR,
  goldGram22SAR,
  goldGram21SAR,
  goldGram18SAR,
  goldGram14SAR,
  lastUpdated
} = storeToRefs(ratesStore)

const now = ref(Date.now())
let timeAgoTimer: ReturnType<typeof setInterval> | undefined

const timeAgo = computed(() => {
  void now.value
  if (!lastUpdated.value) return t('index.notUpdated')

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(lastUpdated.value).getTime()) / 1000))
  if (elapsedSeconds < 60) return elapsedSeconds < 5 ? t('index.justNow') : t('index.secondsAgo', { n: elapsedSeconds })

  const minutes = Math.floor(elapsedSeconds / 60)
  if (minutes < 60) return minutes === 1 ? t('index.minuteAgo') : t('index.minutesAgo', { n: minutes })

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? t('index.hourAgo') : t('index.hoursAgo', { n: hours })

  const days = Math.floor(hours / 24)
  return days === 1 ? t('index.dayAgo') : t('index.daysAgo', { n: days })
})

const loading = ref(false)

const handleRefresh = async () => {
  if (!online.value) return
  loading.value = true
  try {
    await ratesStore.fetchRates()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  timeAgoTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  if (online.value && !lastUpdated.value) {
    handleRefresh()
  }
})

onUnmounted(() => {
  if (timeAgoTimer) clearInterval(timeAgoTimer)
})
</script>

<template>
  <div class="px-4">
    <div class="flex flex-col p-8 gap-5">
      <div class="text-2xl font-black flex justify-center items-center gap-3">
        <img
          src="/img/gold.gif"
          alt="الذهب"
          class="h-16"
        >
        {{ t('index.title') }}
      </div>
      <p class="text-muted text-justify text-sm">
        {{ t('index.description') }}
      </p>
    </div>

    <p class="flex justify-start items-center text-primary p-1.5 text-sm">
      <UIcon
        name="i-lucide-globe"
        class="w-4 h-4 inline-block me-1"
      />
      {{ t('index.fetchingPrices') }}
    </p>

    <!-- حالة الاتصال بالإنترنت -->
    <template v-if="online">
      <div class="bg-success/10 border border-dashed border-success/50 rounded-lg text-success p-4 flex items-center gap-3">
        <UIcon
          name="i-lucide-wifi"
          class="w-10 h-10"
        />
        <div>
          <div class="font-semibold">
            {{ t('index.online') }}
          </div>
        </div>
        <div class="ms-auto">
          <UButton
            :loading="loading"
            loading-icon="i-lucide-loader"
            color="success"
            @click="handleRefresh"
          >
            {{ t('index.refresh') }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- حالة عدم الاتصال -->
    <template v-else>
      <div class="bg-error/10 border border-dashed border-error/50 rounded-lg text-error p-4 flex items-center gap-3">
        <UIcon
          name="i-lucide-wifi-off"
          class="w-10 h-10"
        />
        <div>
          <div class="font-semibold">
            {{ t('index.offline') }}
          </div>
          <div class="text-xs text-muted mt-1">
            {{ t('index.offlineDesc') }}
          </div>
        </div>
      </div>
    </template>

    <!-- عرض كافة عيارات الذهب المحفوظة -->
    <div class="grid grid-cols-2 gap-3 my-4">
      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">{{ t('index.gram24') }}</span>
        <span class="text-lg font-bold text-amber-500">
          {{ goldGram24SAR ? `${goldGram24SAR.toFixed(2)} ر.س` : t('index.notAvailable') }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">{{ t('index.gram22') }}</span>
        <span class="text-lg font-bold text-amber-500">
          {{ goldGram22SAR ? `${goldGram22SAR.toFixed(2)} ر.س` : t('index.notAvailable') }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">{{ t('index.gram21') }}</span>
        <span class="text-lg font-bold text-amber-600">
          {{ goldGram21SAR ? `${goldGram21SAR.toFixed(2)} ر.س` : t('index.notAvailable') }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">{{ t('index.gram18') }}</span>
        <span class="text-lg font-bold text-amber-600">
          {{ goldGram18SAR ? `${goldGram18SAR.toFixed(2)} ر.س` : t('index.notAvailable') }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col col-span-2">
        <span class="text-xs text-muted">{{ t('index.gram14') }}</span>
        <span class="text-lg font-bold text-amber-700">
          {{ goldGram14SAR ? `${goldGram14SAR.toFixed(2)} ر.س` : t('index.notAvailable') }}
        </span>
      </div>
    </div>

    <!-- وقت آخر تحديث الصيغة النسبية -->
    <p class="flex justify-end items-center text-muted p-1.5 text-sm">
      <UIcon
        name="i-lucide-clock"
        class="w-4 h-4 inline-block me-1"
      />
      {{ t('index.lastUpdated') }} {{ lastUpdated ? timeAgo : t('index.notUpdated') }}
    </p>
  </div>
</template>
