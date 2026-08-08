<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t } = useI18n()

const online = useOnline()
const ratesStore = useRatesStore()
const {
  goldGram24SAR,
  goldGram22SAR,
  goldGram21SAR,
  goldGram18SAR,
  goldGram14SAR,
  lastUpdated
} = storeToRefs(ratesStore)

const isDrawerOpen = ref<boolean>(false)
const selectedKarat = ref<number>(21)
const weight = ref<number>(1)
const isManualPrice = ref<boolean>(false)
const customGramPrice = ref<number | null>(null)
const goldType = ref<string>('investment')

const karatOptions = [
  { label: t('buy.karat24'), value: 24 },
  { label: t('buy.karat22'), value: 22 },
  { label: t('buy.karat21'), value: 21 },
  { label: t('buy.karat18'), value: 18 },
  { label: t('buy.karat14'), value: 14 }
]

const goldTypes = [
  { label: t('zakah.investment'), value: 'investment' },
  { label: t('zakah.personal'), value: 'personal' }
]

const currentGramPrice = computed(() => {
  if (isManualPrice.value && customGramPrice.value !== null) {
    return customGramPrice.value
  }

  switch (selectedKarat.value) {
    case 24: return goldGram24SAR.value
    case 22: return goldGram22SAR.value
    case 21: return goldGram21SAR.value
    case 18: return goldGram18SAR.value
    case 14: return goldGram14SAR.value
    default: return goldGram21SAR.value
  }
})

const nisabThreshold = computed(() => {
  return 85 * goldGram24SAR.value
})

const goldValue = computed(() => (weight.value || 0) * currentGramPrice.value)

const equivalent24kWeight = computed(() => {
  if (selectedKarat.value === 24) return weight.value || 0
  return (weight.value || 0) * (selectedKarat.value / 24)
})

const meetsNisab = computed(() => {
  if (goldType.value === 'personal') return false
  return equivalent24kWeight.value >= 85
})

const zakahDue = computed(() => {
  if (!meetsNisab.value) return 0
  return goldValue.value * 0.025
})

const zakahStatus = computed(() => {
  if (goldType.value === 'personal') {
    return {
      status: 'exempt',
      label: t('zakah.exempt'),
      description: t('zakah.exemptDesc'),
      icon: 'i-lucide-info'
    }
  }

  if (!meetsNisab.value) {
    const remaining = Math.max(0, 85 - equivalent24kWeight.value)
    return {
      status: 'below_nisab',
      label: t('zakah.belowNisab'),
      description: t('zakah.belowNisabDesc', { n: equivalent24kWeight.value.toFixed(2), m: remaining.toFixed(2) }),
      icon: 'i-lucide-alert-circle'
    }
  }

  return {
    status: 'due',
    label: t('zakah.due'),
    description: t('zakah.dueDesc'),
    icon: 'i-lucide-check-circle'
  }
})

onMounted(() => {
  if (online.value && !lastUpdated.value) {
    ratesStore.fetchRates()
  }
})
</script>

<template>
  <div class="px-4 pb-12 max-w-2xl mx-auto">
    <!-- الهيدر الرئيسي -->
    <div class="flex items-center justify-between my-5">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-scroll-text"
          class="w-6 h-6 text-amber-500"
        />
        <h1 class="text-2xl font-black">
          {{ t('zakah.title') }}
        </h1>
      </div>
    </div>

    <!-- بطاقة إدخال البيانات -->
    <UCard class="p-2 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2 font-bold text-lg">
          <UIcon
            name="i-lucide-sliders"
            class="w-5 h-5 text-amber-500"
          />
          {{ t('zakah.specsTitle') }}
        </div>
      </template>

      <div class="space-y-6">
        <!-- نوع الذهب -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('zakah.goldTypeLabel') }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="item in goldTypes"
              :key="item.value"
              type="button"
              class="py-2.5 px-2 rounded-lg text-sm font-semibold border transition-all"
              :class="goldType === item.value
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-surface border-accented hover:border-amber-400'"
              @click="goldType = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- اختيار العيار -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('zakah.karatLabel') }}</label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="item in karatOptions"
              :key="item.value"
              type="button"
              class="py-2.5 px-2 rounded-lg text-sm font-semibold border transition-all"
              :class="selectedKarat === item.value
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-surface border-accented hover:border-amber-400'"
              @click="selectedKarat = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- الوزن الإجمالي -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('zakah.weightLabel') }}</label>
          <UInput
            v-model.number="weight"
            class="w-full"
            type="number"
            min="0.1"
            step="0.1"
            icon="i-lucide-scale"
            :placeholder="t('zakah.weightPlaceholder')"
          />
        </div>

        <!-- تحديد السعر يدوياً -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-medium text-muted">{{ t('zakah.priceLabel') }}</label>
            <button
              type="button"
              class="text-xs text-amber-600 underline"
              @click="isManualPrice = !isManualPrice"
            >
              {{ isManualPrice ? t('zakah.autoPrice') : t('zakah.manualPrice') }}
            </button>
          </div>

          <UInput
            v-if="isManualPrice"
            v-model.number="customGramPrice"
            class="w-full"
            type="number"
            min="0"
            icon="i-lucide-tag"
            :placeholder="t('zakah.manualPricePlaceholder')"
          />

          <div
            v-else
            class="p-2.5 px-3 bg-surface border border-accented rounded-xl text-sm"
          >
            <span class="text-muted">{{ t('zakah.autoPriceLabel', { n: selectedKarat }) }}:</span>
            <span class="font-bold text-foreground mr-2">
              {{ currentGramPrice ? `${currentGramPrice.toFixed(2)} ر.س` : t('zakah.loading') }}
            </span>
          </div>
        </div>

        <!-- تنبيه النصاب -->
        <div class="p-3 border border-amber-500/30 rounded-xl bg-amber-500/5 text-xs text-muted space-y-1">
          <div class="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <UIcon
              name="i-lucide-info"
              class="w-4 h-4 shrink-0"
            />
            {{ t('zakah.nisabInfoTitle') }}
          </div>
          <p>{{ t('zakah.nisabInfo') }}</p>
          <p
            v-if="lastUpdated"
            class="text-[10px]"
          >
            {{ t('zakah.lastPriceUpdate') }} {{ new Date(lastUpdated).toLocaleString('ar-SA') }}
          </p>
        </div>

        <!-- زر حساب الزكاة -->
        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-calculator"
          class="font-bold mt-4"
          @click="isDrawerOpen = true"
        >
          {{ t('zakah.calculateBtn') }}
        </UButton>
      </div>
    </UCard>

    <!-- Drawer النتيجة -->
    <UDrawer
      v-model:open="isDrawerOpen"
      :title="t('zakah.drawerTitle')"
      :description="t('zakah.drawerDesc')"
    >
      <template #body>
        <div class="space-y-4 p-2">
          <!-- حالة الزكاة -->
          <div
            class="p-3 rounded-xl border-2 flex items-start gap-3"
            :class="{
              'border-blue-500/50 bg-blue-500/10': zakahStatus.status === 'exempt',
              'border-amber-500/50 bg-amber-500/10': zakahStatus.status === 'below_nisab',
              'border-green-500/50 bg-green-500/10': zakahStatus.status === 'due'
            }"
          >
            <UIcon
              :name="zakahStatus.icon"
              class="w-8 h-8 mt-1 shrink-0"
              :class="{
                'text-blue-600': zakahStatus.status === 'exempt',
                'text-amber-600': zakahStatus.status === 'below_nisab',
                'text-green-600': zakahStatus.status === 'due'
              }"
            />
            <div>
              <h3 class="font-bold text-base">
                {{ zakahStatus.label }}
              </h3>
              <p class="text-xs text-muted mt-1">
                {{ zakahStatus.description }}
              </p>
            </div>
          </div>

          <!-- تفاصيل الحساب -->
          <div class="p-4 border border-amber-500/30 rounded-xl bg-surface space-y-3 text-sm">
            <div class="flex justify-between text-muted">
              <span>{{ t('zakah.totalWeight', { n: selectedKarat }) }}:</span>
              <span class="font-semibold text-foreground">
                {{ weight.toFixed(2) }} جرام
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('zakah.equivalent24k') }}</span>
              <span class="font-semibold text-foreground">
                {{ equivalent24kWeight.toFixed(2) }} جرام
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('zakah.currentValue') }}</span>
              <span class="font-semibold text-foreground">
                {{ goldValue.toFixed(2) }} ر.س
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('zakah.nisabThreshold') }}</span>
              <span class="font-semibold text-foreground">
                {{ nisabThreshold.toFixed(2) }} ر.س
              </span>
            </div>

            <USeparator />

            <div
              v-if="meetsNisab"
              class="flex justify-between items-center text-base font-black"
            >
              <span>{{ t('zakah.zakahAmount') }}</span>
              <span class="text-xl text-amber-600">
                {{ zakahDue.toFixed(2) }} ر.س
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <UButton
          block
          color="neutral"
          variant="outline"
          class="mb-5 py-2"
          @click="isDrawerOpen = false"
        >
          {{ t('zakah.close') }}
        </UButton>
      </template>
    </UDrawer>
  </div>
</template>
