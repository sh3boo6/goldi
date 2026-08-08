<script setup lang="ts">
import { storeToRefs } from 'pinia'

// استخدام VueUse للتحقق من الاتصال
const online = useOnline()

// جلب متجر Pinia
const ratesStore = useRatesStore()

// التحقق من عرض صفحة المقدمة
const { hasShownIntro } = useIntro()

// التحويل التلقائي إلى صفحة المقدمة عند أول فتح
onMounted(() => {
  if (!hasShownIntro.value) {
    navigateTo('/intro')
  }
})

// استخراج كافة العيارات والبيانات مع الحفاظ على الـ Reactivity
const {
  goldGram24SAR,
  goldGram22SAR,
  goldGram21SAR,
  goldGram18SAR,
  goldGram14SAR,
  lastUpdated
} = storeToRefs(ratesStore)

// تحويل تاريخ آخر تحديث إلى صيغة نسبية (منذ دقيقة/ساعة/يوم)
const now = ref(Date.now())
let timeAgoTimer: ReturnType<typeof setInterval> | undefined

const timeAgo = computed(() => {
  void now.value
  if (!lastUpdated.value) return 'لم يتم التحديث بعد'

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(lastUpdated.value).getTime()) / 1000))
  if (elapsedSeconds < 60) return elapsedSeconds < 5 ? 'الآن' : `منذ ${elapsedSeconds} ثوانٍ`

  const minutes = Math.floor(elapsedSeconds / 60)
  if (minutes < 60) return `منذ ${minutes === 1 ? 'دقيقة' : `${minutes} دقائق`}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours === 1 ? 'ساعة' : `${hours} ساعات`}`

  const days = Math.floor(hours / 24)
  return `منذ ${days === 1 ? 'يوم' : `${days} أيام`}`
})

// حالة التحميل بزر التحديث
const loading = ref(false)

// دالة لتحديث الأسعار عند الضغط على الزر
const handleRefresh = async () => {
  if (!online.value) return
  loading.value = true
  try {
    await ratesStore.fetchRates()
  } finally {
    loading.value = false
  }
}

// جلب البيانات تلقائياً عند فتح الصفحة إذا كانت الشبكة متصلة
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
        برنامج الذهب
      </div>
      <p class="text-muted text-justify text-sm">
        برنامج الذهب هو برنامج يهدف إلى تعزيز الاستثمار في الذهب وتوفير منصة آمنة وموثوقة للمستثمرين لشراء وبيع الذهب بسهولة. يتيح البرنامج للمستخدمين الوصول إلى أسعار الذهب الحية، وإجراء المعاملات المالية بشكل سريع وفعال، مع ضمان الشفافية والأمان في جميع العمليات.
      </p>
    </div>

    <p class="flex justify-start items-center text-primary p-1.5 text-sm">
      <UIcon
        name="i-lucide-globe"
        class="w-4 h-4 inline-block me-1"
      />
      جلب الأسعار من الإنترنت
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
            متصل بالإنترنت
          </div>
        </div>
        <div class="ms-auto">
          <UButton
            :loading="loading"
            loading-icon="i-lucide-loader"
            color="success"
            @click="handleRefresh"
          >
            تحديث
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
            غير متصل بالإنترنت
          </div>
          <div class="text-xs text-muted mt-1">
            أنت الآن غير متصل بالإنترنت
          </div>
        </div>
      </div>
    </template>

    <!-- عرض كافة عيارات الذهب المحفوظة -->
    <div class="grid grid-cols-2 gap-3 my-4">
      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">جرام عيار 24</span>
        <span class="text-lg font-bold text-amber-500">
          {{ goldGram24SAR ? `${goldGram24SAR.toFixed(2)} ر.س` : '---' }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">جرام عيار 22</span>
        <span class="text-lg font-bold text-amber-500">
          {{ goldGram22SAR ? `${goldGram22SAR.toFixed(2)} ر.س` : '---' }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">جرام عيار 21</span>
        <span class="text-lg font-bold text-amber-600">
          {{ goldGram21SAR ? `${goldGram21SAR.toFixed(2)} ر.س` : '---' }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col">
        <span class="text-xs text-muted">جرام عيار 18</span>
        <span class="text-lg font-bold text-amber-600">
          {{ goldGram18SAR ? `${goldGram18SAR.toFixed(2)} ر.س` : '---' }}
        </span>
      </div>

      <div class="p-3 border border-accented rounded-lg bg-surface flex flex-col col-span-2">
        <span class="text-xs text-muted">جرام عيار 14</span>
        <span class="text-lg font-bold text-amber-700">
          {{ goldGram14SAR ? `${goldGram14SAR.toFixed(2)} ر.س` : '---' }}
        </span>
      </div>
    </div>

    <!-- وقت آخر تحديث الصيغة النسبية -->
    <p class="flex justify-end items-center text-muted p-1.5 text-sm">
      <UIcon
        name="i-lucide-clock"
        class="w-4 h-4 inline-block me-1"
      />
      آخر تحديث: {{ lastUpdated ? timeAgo : 'لم يتم التحديث بعد' }}
    </p>
  </div>
</template>
