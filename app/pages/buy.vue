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
  defaultKarat,
  autoVat,
  ingotCharge,
  plainCharge,
  fancyCharge,
  luxuriousCharge
} = storeToRefs(ratesStore)

// تحديث selectedKarat في حال تم تعديله في الإعدادات
watch(defaultKarat, (newKarat) => {
  selectedKarat.value = newKarat
})

// تحديث includeVat في حال تم تعديله في الإعدادات
watch(autoVat, (newAutoVat) => {
  includeVat.value = newAutoVat
})

// تحديث أسعار المصنعية في حال تم تعديلها في الإعدادات
watch([ingotCharge, plainCharge, fancyCharge, luxuriousCharge], () => {
  categoryCharges.ingot = ingotCharge.value
  categoryCharges.plain = plainCharge.value
  categoryCharges.fancy = fancyCharge.value
  categoryCharges.luxurious = luxuriousCharge.value
})

// 2. حالات نموذج الشراء والتسعير والـ Drawer
const isDrawerOpen = ref<boolean>(false)
const selectedKarat = ref<number>(defaultKarat.value)
const weight = ref<number>(1)
const selectedCategory = ref<string>('plain')
const customMakingCharge = ref<number | null>(null)
const isManualMakingCharge = ref<boolean>(false)
const includeVat = ref<boolean>(autoVat.value)

// السعر المعروض من البائع
const sellerPrice = ref<number | null>(null)

// خيارات فئات المشغولات
const categories = [
  { label: t('buy.categoryIngot'), value: 'ingot' },
  { label: t('buy.categoryPlain'), value: 'plain' },
  { label: t('buy.categoryFancy'), value: 'fancy' },
  { label: t('buy.categoryLuxurious'), value: 'luxurious' }
]

const categoryCharges: Record<string, number> = {
  ingot: ingotCharge.value,
  plain: plainCharge.value,
  fancy: fancyCharge.value,
  luxurious: luxuriousCharge.value
}

// 3. حساب سعر المصنعية للجرام الواحد
const computedMakingChargePerGram = computed(() => {
  if (isManualMakingCharge.value && customMakingCharge.value !== null) {
    return customMakingCharge.value
  }

  let charge = categoryCharges[selectedCategory.value] || 30

  if (weight.value > 50) {
    charge *= 0.85
  } else if (weight.value > 20) {
    charge *= 0.90
  }

  return Math.round(charge)
})

// 4. تحديد سعر الجرام الحالي للعيار
const currentGramPrice = computed(() => {
  switch (selectedKarat.value) {
    case 24: return goldGram24SAR.value
    case 22: return goldGram22SAR.value
    case 21: return goldGram21SAR.value
    case 18: return goldGram18SAR.value
    case 14: return goldGram14SAR.value
    default: return goldGram21SAR.value
  }
})

// 5. الحسابات الإجمالية للسعر العادل
const rawGoldTotal = computed(() => (weight.value || 0) * currentGramPrice.value)
const makingChargeTotal = computed(() => (weight.value || 0) * computedMakingChargePerGram.value)
const subtotal = computed(() => rawGoldTotal.value + makingChargeTotal.value)
const vatAmount = computed(() => includeVat.value ? subtotal.value * 0.15 : 0)
const fairGrandTotal = computed(() => subtotal.value + vatAmount.value)

// 6. تحليل تقييم سعر البائع
const priceAnalysis = computed(() => {
  if (!sellerPrice.value || sellerPrice.value <= 0) return null

  const diff = sellerPrice.value - fairGrandTotal.value
  const diffPercentage = (diff / fairGrandTotal.value) * 100

  if (Math.abs(diffPercentage) <= 3) {
    return {
      status: 'fair',
      label: t('buy.fair'),
      icon: 'i-lucide-check-circle',
      diffText: `${Math.abs(diff).toFixed(2)} ر.س (${t('buy.fairRange')})`
    }
  } else if (diffPercentage > 3 && diffPercentage <= 10) {
    return {
      status: 'slightly_high',
      label: t('buy.slightlyHigh'),
      icon: 'i-lucide-alert-triangle',
      diffText: t('buy.higherBy', { n: diff.toFixed(2) })
    }
  } else if (diffPercentage > 10) {
    return {
      status: 'expensive',
      label: t('buy.expensive'),
      icon: 'i-lucide-x-circle',
      diffText: t('buy.higherBy', { n: diff.toFixed(2) })
    }
  } else {
    return {
      status: 'bargain',
      label: t('buy.bargain'),
      icon: 'i-lucide-sparkles',
      diffText: t('buy.saveBy', { n: Math.abs(diff).toFixed(2) })
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
          name="i-lucide-shopping-bag"
          class="w-6 h-6 text-amber-500"
        />
        <h1 class="text-2xl font-black">
          {{ t('buy.title') }}
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
          {{ t('buy.specsTitle') }}
        </div>
      </template>

      <div class="space-y-6">
        <!-- حقل السعر المباشر من البائع -->
        <div class="p-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <label class="block text-sm font-bold mb-2 text-amber-700 dark:text-amber-400">
            {{ t('buy.sellerPriceLabel') }}
          </label>
          <UInput
            v-model.number="sellerPrice"
            class="w-full"
            type="number"
            min="1"
            icon="i-lucide-tag"
            size="lg"
            :placeholder="t('buy.sellerPricePlaceholder')"
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

        <!-- وزن القطعة -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">{{ t('buy.weightLabel') }}</label>
          <UInput
            v-model.number="weight"
            class="w-full"
            type="number"
            min="0.1"
            step="0.1"
            icon="i-lucide-scale"
            :placeholder="t('buy.weightPlaceholder')"
          />
        </div>

        <!-- نوع القطعة والمصنعية الآلية -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-medium text-muted">{{ t('buy.categoryLabel') }}</label>
            <button
              type="button"
              class="text-xs text-amber-600 underline"
              @click="isManualMakingCharge = !isManualMakingCharge"
            >
              {{ isManualMakingCharge ? t('buy.enableAutoCalc') : t('buy.setManualCharge') }}
            </button>
          </div>

          <USelect
            v-if="!isManualMakingCharge"
            v-model="selectedCategory"
            :items="categories"
            class="w-full"
          />

          <UInput
            v-else
            v-model.number="customMakingCharge"
            type="number"
            min="0"
            icon="i-lucide-hammer"
            :placeholder="t('buy.manualChargePlaceholder')"
          />
        </div>

        <!-- الضريبة -->
        <div class="flex items-center justify-between p-3 border border-accented rounded-lg bg-surface">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-receipt"
              class="w-5 h-5 text-muted"
            />
            <span class="text-sm font-medium">{{ t('buy.vatLabel') }}</span>
          </div>
          <USwitch v-model="includeVat" />
        </div>

        <!-- زر فتح الفاتورة وتقييم السعر -->
        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-calculator"
          class="font-bold mt-4"
          @click="isDrawerOpen = true"
        >
          {{ t('buy.showInvoice') }}
        </UButton>
      </div>
    </UCard>

    <!-- Drawer الفاتورة والنتيجة -->
    <UDrawer
      v-model:open="isDrawerOpen"
      :title="t('buy.drawerTitle')"
      :description="t('buy.drawerDesc')"
    >
      <template #body>
        <div class="space-y-4 p-2">
          <!-- نتيجة التقييم عند إدخال سعر البائع -->
          <div
            v-if="priceAnalysis"
            class="p-3 rounded-xl border-2 flex items-start gap-3"
            :class="{
              'border-green-500/50 bg-green-500/10': priceAnalysis.status === 'fair',
              'border-amber-500/50 bg-amber-500/10': priceAnalysis.status === 'slightly_high',
              'border-red-500/50 bg-red-500/10': priceAnalysis.status === 'expensive',
              'border-blue-500/50 bg-blue-500/10': priceAnalysis.status === 'bargain'
            }"
          >
            <UIcon
              :name="priceAnalysis.icon"
              class="w-8 h-8 mt-1 shrink-0"
              :class="{
                'text-green-600': priceAnalysis.status === 'fair',
                'text-amber-600': priceAnalysis.status === 'slightly_high',
                'text-red-600': priceAnalysis.status === 'expensive',
                'text-blue-600': priceAnalysis.status === 'bargain'
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

          <!-- بطاقة تفاصيل الفاتورة -->
          <div class="p-4 border border-amber-500/30 rounded-xl bg-surface space-y-3 text-sm">
            <div
              v-if="sellerPrice"
              class="flex justify-between items-center p-2 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400 font-bold"
            >
              <span>{{ t('buy.sellerPrice') }}</span>
              <span class="text-base">{{ sellerPrice.toFixed(2) }} ر.س</span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('buy.gramPrice', { n: selectedKarat }) }}:</span>
              <span class="font-semibold text-foreground">
                {{ currentGramPrice ? `${currentGramPrice.toFixed(2)} ر.س` : '---' }}
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('buy.chargePerGram') }}</span>
              <span class="font-semibold text-foreground">
                {{ computedMakingChargePerGram }} ر.س
              </span>
            </div>

            <USeparator />

            <div class="flex justify-between text-muted">
              <span>{{ t('buy.goldValue', { n: weight }) }}</span>
              <span class="font-semibold text-foreground">
                {{ rawGoldTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>{{ t('buy.totalCharge') }}</span>
              <span class="font-semibold text-foreground">
                {{ makingChargeTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <div
              v-if="includeVat"
              class="flex justify-between text-muted"
            >
              <span>{{ t('buy.vat') }}</span>
              <span class="font-semibold text-foreground">
                {{ vatAmount.toFixed(2) }} ر.س
              </span>
            </div>

            <USeparator class="my-2" />

            <div class="flex justify-between items-center text-base font-black">
              <span>{{ t('buy.fairTotal') }}</span>
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
          {{ t('buy.closeInvoice') }}
        </UButton>
      </template>
    </UDrawer>
  </div>
</template>
