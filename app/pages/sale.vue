<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t } = useI18n()

// 1. الاتصال بالإنترنت والصلة بمتجر الأسعار
const online = useOnline()
const ratesStore = useRatesStore()
const {
  goldGram24SAR,
  goldGram22SAR,
  goldGram21SAR,
  goldGram18SAR,
  goldGram14SAR,
  lastUpdated,
  defaultKarat
} = storeToRefs(ratesStore)

// تحديث selectedKarat في حال تم تعديله في الإعدادات
watch(defaultKarat, (newKarat) => {
  selectedKarat.value = newKarat
})

// 2. حالات نموذج بيع الذهب المستعمل والـ Drawer
const isDrawerOpen = ref<boolean>(false)
const selectedKarat = ref<number>(defaultKarat.value)
const weight = ref<number>(1)
const selectedItemType = ref<string>('jewelry')
const stonesDeduction = ref<number>(0)
const customGramPrice = ref<number | null>(null)
const isManualPrice = ref<boolean>(false)

// السعر المعروض من الصائغ للشراء منك
const buyerOfferPrice = ref<number | null>(null)

// خيارات نوع القطعة لتحديد الخصومات
const itemTypes = [
  { label: t('sale.typeJewelry'), value: 'jewelry' },
  { label: t('sale.typeIngot'), value: 'ingot' },
  { label: t('sale.typeScrap'), value: 'scrap' }
]

// 3. تحديد سعر الجرام المباشر للشراء
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

// 4. الحسابات الإجمالية لقيمة الذهب الصافي
const netWeight = computed(() => Math.max(0, (weight.value || 0) - (stonesDeduction.value || 0)))
const rawGoldTotal = computed(() => netWeight.value * currentGramPrice.value)

// استرداد مصنعية جزئي للسبائك فقط (حوالي 5 ريال/جرام)
const cashbackTotal = computed(() => {
  if (selectedItemType.value === 'ingot') {
    return netWeight.value * 5
  }
  return 0
})

const fairGrandTotal = computed(() => rawGoldTotal.value + cashbackTotal.value)

// 5. تحليل تقييم عرض الصائغ
const priceAnalysis = computed(() => {
  if (!buyerOfferPrice.value || buyerOfferPrice.value <= 0) return null

  const diff = buyerOfferPrice.value - fairGrandTotal.value
  const diffPercentage = (diff / fairGrandTotal.value) * 100

  if (Math.abs(diffPercentage) <= 2) {
    return {
      status: 'fair',
      label: t('sale.fairOffer'),
      icon: 'i-lucide-check-circle',
      diffText: `${Math.abs(diff).toFixed(2)} ر.س (${t('sale.withinRange')})`
    }
  } else if (diffPercentage < -2 && diffPercentage >= -7) {
    return {
      status: 'slightly_low',
      label: t('sale.slightlyLow'),
      icon: 'i-lucide-alert-triangle',
      diffText: t('sale.lowerBy', { n: Math.abs(diff).toFixed(2) })
    }
  } else if (diffPercentage < -7) {
    return {
      status: 'unfair',
      label: t('sale.unfair'),
      icon: 'i-lucide-x-circle',
      diffText: t('sale.lowerBy', { n: Math.abs(diff).toFixed(2) })
    }
  } else {
    return {
      status: 'excellent',
      label: t('sale.excellent'),
      icon: 'i-lucide-sparkles',
      diffText: t('buy.higherBy', { n: diff.toFixed(2) })
    }
  }
})

// قائمة العيارات
const karatOptions = [
  { label: t('buy.karat24'), value: 24 },
  { label: t('buy.karat22'), value: 22 },
  { label: t('buy.karat21'), value: 21 },
  { label: t('buy.karat18'), value: 18 },
  { label: t('buy.karat14'), value: 14 }
]

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
          name="i-lucide-coins"
          class="w-6 h-6 text-amber-500"
        />
        <h1 class="text-2xl font-black">
          {{ t('sale.title') }}
        </h1>
      </div>
    </div>

    <!-- بطاقة إدخال البيانات الرئيسية -->
    <UCard class="p-2 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2 font-bold text-lg">
          <UIcon
            name="i-lucide-sliders"
            class="w-5 h-5 text-amber-500"
          />
          {{ t('sale.specsTitle') }}
        </div>
      </template>

      <div class="space-y-6">
        <!-- حقل السعر المعروض من الصائغ/المشتري -->
        <div class="p-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <label class="block text-sm font-bold mb-2 text-amber-700 dark:text-amber-400">
            {{ t('sale.buyerOfferLabel') }}
          </label>
          <UInput
            v-model.number="buyerOfferPrice"
            class="w-full"
            type="number"
            min="1"
            icon="i-lucide-hand-coins"
            size="lg"
            :placeholder="t('sale.buyerOfferPlaceholder')"
          />
        </div>

        <!-- اختيار العيار -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('buy.karatLabel') }}</label>
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
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('sale.weightLabel') }}</label>
          <UInput
            v-model.number="weight"
            class="w-full"
            type="number"
            min="0.1"
            step="0.1"
            icon="i-lucide-scale"
            :placeholder="t('sale.weightPlaceholder')"
          />
        </div>

        <!-- خصم وزن الفصوص/الأحجار غير الذهبية -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('sale.stonesLabel') }}</label>
          <UInput
            v-model.number="stonesDeduction"
            class="w-full"
            type="number"
            min="0"
            step="0.1"
            icon="i-lucide-gem"
            :placeholder="t('sale.stonesPlaceholder')"
          />
        </div>

        <!-- نوع القطعة -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-medium text-muted">{{ t('sale.itemTypeLabel') }}</label>
            <button
              type="button"
              class="text-xs text-amber-600 underline"
              @click="isManualPrice = !isManualPrice"
            >
              {{ isManualPrice ? t('sale.autoPrice') : t('sale.manualPrice') }}
            </button>
          </div>

          <USelect
            v-if="!isManualPrice"
            v-model="selectedItemType"
            :items="itemTypes"
            class="w-full"
          />

          <UInput
            v-else
            v-model.number="customGramPrice"
            class="w-full"
            type="number"
            min="0"
            icon="i-lucide-dollar-sign"
            :placeholder="t('sale.manualPricePlaceholder')"
          />
        </div>

        <!-- تنبيه عدم وجود ضريبة أو مصنعية -->
        <div class="p-3 border border-accented rounded-lg bg-surface text-xs text-muted flex items-center gap-2">
          <UIcon
            name="i-lucide-info"
            class="w-5 h-5 text-amber-500 shrink-0"
          />
          <span>{{ t('sale.noVatNotice') }}</span>
        </div>

        <!-- زر فتح الفاتورة والتقييم -->
        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-calculator"
          class="font-bold mt-4"
          @click="isDrawerOpen = true"
        >
          {{ t('sale.showEvaluation') }}
        </UButton>
      </div>
    </UCard>

    <!-- Drawer الفاتورة والنتيجة -->
    <UDrawer
      v-model:open="isDrawerOpen"
      :title="t('sale.drawerTitle')"
      :description="t('sale.drawerDesc')"
    >
      <template #body>
        <div class="space-y-4 p-2">
          <!-- نتيجة التقييم عند إدخال عرض الصائغ -->
          <div
            v-if="priceAnalysis"
            class="p-3 rounded-xl border-2 flex items-start gap-3"
            :class="{
              'border-green-500/50 bg-green-500/10': priceAnalysis.status === 'fair' || priceAnalysis.status === 'excellent',
              'border-amber-500/50 bg-amber-500/10': priceAnalysis.status === 'slightly_low',
              'border-red-500/50 bg-red-500/10': priceAnalysis.status === 'unfair'
            }"
          >
            <UIcon
              :name="priceAnalysis.icon"
              class="w-8 h-8 mt-1 shrink-0"
              :class="{
                'text-green-600': priceAnalysis.status === 'fair' || priceAnalysis.status === 'excellent',
                'text-amber-600': priceAnalysis.status === 'slightly_low',
                'text-red-600': priceAnalysis.status === 'unfair'
              }"
            />
            <div>
              <h3 class="font-bold text-base">
                {{ priceAnalysis.label }}
              </h3>
              <p class="text-xs text-muted mt-1">
                {{ priceAnalysis.diffText }}
              </p>
            </div>
          </div>

          <!-- تفاصيل الفاتورة -->
          <div class="p-4 border border-amber-500/30 rounded-xl bg-surface space-y-3 text-sm">
            <div
              v-if="buyerOfferPrice"
              class="flex justify-between items-center p-2 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400 font-bold"
            >
              <span>{{ t('sale.buyerOffer') }}</span>
              <span class="text-base">{{ buyerOfferPrice.toFixed(2) }} ر.س</span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('sale.buyPrice', { n: selectedKarat }) }}:</span>
              <span class="font-semibold text-foreground">
                {{ currentGramPrice ? `${currentGramPrice.toFixed(2)} ر.س` : '---' }}
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('sale.netWeight') }}</span>
              <span class="font-semibold text-foreground">
                {{ netWeight.toFixed(2) }} جرام
              </span>
            </div>

            <USeparator />

            <div class="flex justify-between text-muted">
              <span>{{ t('sale.rawGoldValue') }}</span>
              <span class="font-semibold text-foreground">
                {{ rawGoldTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <div
              v-if="cashbackTotal > 0"
              class="flex justify-between text-muted"
            >
              <span>{{ t('sale.cashback') }}</span>
              <span class="font-semibold text-foreground">
                {{ cashbackTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <USeparator class="my-2" />

            <div class="flex justify-between items-center text-base font-black">
              <span>{{ t('sale.fairValue') }}</span>
              <span class="text-xl text-amber-600">
                {{ fairGrandTotal.toFixed(2) }} ر.س
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
          {{ t('sale.closeInvoice') }}
        </UButton>
      </template>
    </UDrawer>
  </div>
</template>
