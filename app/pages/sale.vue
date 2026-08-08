<script setup lang="ts">
import { storeToRefs } from 'pinia'

// 1. الاتصال بالإنترنت والصلة بمتجر الأسعار
const online = useOnline()
const ratesStore = useRatesStore()
const { sanitizeNumberInput } = useArabicNumbers()
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
const stonesDeduction = ref<number>(0) // وزن الفصوص أو الأحجار بالجرام لخصمها
const customGramPrice = ref<number | null>(null)
const isManualPrice = ref<boolean>(false)

// السعر المعروض من الصائغ للشراء منك
const buyerOfferPrice = ref<number | null>(null)

// خيارات نوع القطعة لتحديد الخصومات
const itemTypes = [
  { label: 'مشغولات ذهبية (بدون مصنعية)', value: 'jewelry' },
  { label: 'سبيكة / جنيه (استرداد جزء من المصنعية)', value: 'ingot' },
  { label: 'ذهب مكسور / قشرة', value: 'scrap' }
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
      label: 'عرض عادل ومطابق لسعر السوق',
      icon: 'i-lucide-check-circle',
      diffText: `${Math.abs(diff).toFixed(2)} ر.س (ضمن النطاق العادل)`
    }
  } else if (diffPercentage < -2 && diffPercentage >= -7) {
    return {
      status: 'slightly_low',
      label: 'عرض منخفض قليلاً عن سعر السوق',
      icon: 'i-lucide-alert-triangle',
      diffText: `أقل بـ ${Math.abs(diff).toFixed(2)} ر.س عن القيمة المستحقة`
    }
  } else if (diffPercentage < -7) {
    return {
      status: 'unfair',
      label: 'عرض بخس (أقل بكثير من قيمة الذهب)',
      icon: 'i-lucide-x-circle',
      diffText: `أقل بـ ${Math.abs(diff).toFixed(2)} ر.س عن القيمة المستحقة`
    }
  } else {
    return {
      status: 'excellent',
      label: 'عرض ممتاز أعلى من سعر السوق',
      icon: 'i-lucide-sparkles',
      diffText: `أعلى بـ ${diff.toFixed(2)} ر.س عن السوق`
    }
  }
})

// قائمة العيارات
const karatOptions = [
  { label: 'عيار 24', value: 24 },
  { label: 'عيار 22', value: 22 },
  { label: 'عيار 21', value: 21 },
  { label: 'عيار 18', value: 18 },
  { label: 'عيار 14', value: 14 }
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
          حاسبة تقييم بيع الذهب المستعمل
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
          مواصفات الذهب المراد بيعه
        </div>
      </template>

      <div class="space-y-6">
        <!-- حقل السعر المعروض من الصائغ/المشتري -->
        <div class="p-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <label class="block text-sm font-bold mb-2 text-amber-700 dark:text-amber-400">
            العرض المقدم من الصائغ للشراء منك (ر.س):
          </label>
          <UInput
            :model-value="buyerOfferPrice"
            class="w-full"
            type="number"
            min="1"
            icon="i-lucide-hand-coins"
            size="lg"
            placeholder="أدخل المبلغ المعروض عليك لشراء ذهبك"
            @update:model-value="buyerOfferPrice = sanitizeNumberInput($event)"
          />
        </div>

        <!-- اختيار العيار -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">عيار الذهب:</label>
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
          <label class="block text-sm font-medium mb-2 text-muted">الوزن الإجمالي (جرام):</label>
          <UInput
            :model-value="weight"
            class="w-full"
            type="number"
            min="0.1"
            step="0.1"
            icon="i-lucide-scale"
            placeholder="أدخل وزن القطعة بالجرام"
            @update:model-value="weight = sanitizeNumberInput($event)"
          />
        </div>

        <!-- خصم وزن الفصوص/الأحجار غير الذهبية -->
        <div>
          <label class="block text-sm font-medium mb-2 text-muted">وزن الفصوص/الأحجار لخصمه (إن وجد):</label>
          <UInput
            :model-value="stonesDeduction"
            class="w-full"
            type="number"
            min="0"
            step="0.1"
            icon="i-lucide-gem"
            placeholder="وزن الأحجار أو الزركون بالجرام"
            @update:model-value="stonesDeduction = sanitizeNumberInput($event)"
          />
        </div>

        <!-- نوع القطعة -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-medium text-muted">نوع القطعة:</label>
            <button
              type="button"
              class="text-xs text-amber-600 underline"
              @click="isManualPrice = !isManualPrice"
            >
              {{ isManualPrice ? 'استخدام سعر السوق التلقائي' : 'تحديد سعر الجرام يدوياً' }}
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
            :model-value="customGramPrice"
            class="w-full"
            type="number"
            min="0"
            icon="i-lucide-dollar-sign"
            placeholder="أدخل سعر جرام الشراء المعتمد"
            @update:model-value="customGramPrice = sanitizeNumberInput($event)"
          />
        </div>

        <!-- تنبيه عدم وجود ضريبة أو مصنعية -->
        <div class="p-3 border border-accented rounded-lg bg-surface text-xs text-muted flex items-center gap-2">
          <UIcon
            name="i-lucide-info"
            class="w-5 h-5 text-amber-500 shrink-0"
          />
          <span>تنبيه: بيع الذهب المستعمل يحسب على سعر الذهب الصافي فقط بدون مصنعية أو ضريبة قيمة مضافة.</span>
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
          عرض القيمة العادلة والتقييم
        </UButton>
      </div>
    </UCard>

    <!-- Drawer الفاتورة والنتيجة -->
    <UDrawer
      v-model:open="isDrawerOpen"
      title="تقييم المستحقات وقيمة البيع"
      description="مقارنة العرض المقدم بقيمة الذهب الصافي بالسوق"
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
              <span>المبلغ المعروض من الصائغ:</span>
              <span class="text-base">{{ buyerOfferPrice.toFixed(2) }} ر.س</span>
            </div>

            <div class="flex justify-between text-muted">
              <span>سعر شراء الجرام الصافي (عيار {{ selectedKarat }}):</span>
              <span class="font-semibold text-foreground">
                {{ currentGramPrice ? `${currentGramPrice.toFixed(2)} ر.س` : '---' }}
              </span>
            </div>

            <div class="flex justify-between text-muted">
              <span>الوزن الصافي (بعد خصم الفصوص):</span>
              <span class="font-semibold text-foreground">
                {{ netWeight.toFixed(2) }} جرام
              </span>
            </div>

            <USeparator />

            <div class="flex justify-between text-muted">
              <span>قيمة الذهب الخالص:</span>
              <span class="font-semibold text-foreground">
                {{ rawGoldTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <div
              v-if="cashbackTotal > 0"
              class="flex justify-between text-muted"
            >
              <span>استرداد مصنعية السبيكة التقديري:</span>
              <span class="font-semibold text-foreground">
                {{ cashbackTotal.toFixed(2) }} ر.س
              </span>
            </div>

            <USeparator class="my-2" />

            <div class="flex justify-between items-center text-base font-black">
              <span>القيمة العادلة المستحقة لك:</span>
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
          @click="isDrawerOpen = false"
        >
          إغلاق الفاتورة
        </UButton>
      </template>
    </UDrawer>
  </div>
</template>
