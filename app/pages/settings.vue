<script setup lang="ts">
import { storeToRefs } from 'pinia'

// 1. استخدام متجر الأسعار
const ratesStore = useRatesStore()
const { usdToSar, defaultKarat, autoVat, ingotCharge, plainCharge, fancyCharge, luxuriousCharge } = storeToRefs(ratesStore)

// 2. التحكم في المظهر (Light / Dark / System)
const colorMode = useColorMode()
const toast = useToast()

// عند تغيير العيار في الإعدادات
const setKarat = (karat: number) => {
  ratesStore.setDefaultKarat(karat)
}

// 3. القيم القياسية للتطبيق (الافتراضيات)
const DEFAULT_VALUES = {
  karat: 21,
  autoVat: true,
  ingotCharge: 15,
  plainCharge: 30,
  fancyCharge: 50,
  luxuriousCharge: 80
}

// 4. الحالات التفاعلية
const isResetModalOpen = ref<boolean>(false)

// خيارات العيار الافتراضي
const karatOptions = [
  { label: 'عيار 24', value: 24 },
  { label: 'عيار 22', value: 22 },
  { label: 'عيار 21', value: 21 },
  { label: 'عيار 18', value: 18 }
]

// خيارات الثيم
const themeOptions = [
  { label: 'فاتح', value: 'light', icon: 'i-lucide-sun' },
  { label: 'داكن', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'النظام', value: 'system', icon: 'i-lucide-laptop' }
]

// دالة حفظ الإعدادات
const handleSaveSettings = () => {
  toast.add({
    title: 'تم حفظ الإعدادات بنجاح',
    description: 'تم تحديث كافة تفضيلات التطبيق والمظهر.',
    color: 'success',
    icon: 'i-lucide-check-circle'
  })
}

// دالة تأكيد استعادة الافتراضيات
const confirmResetDefaults = () => {
  ratesStore.setDefaultKarat(DEFAULT_VALUES.karat)
  ratesStore.setAutoVat(DEFAULT_VALUES.autoVat)
  ratesStore.setIngotCharge(DEFAULT_VALUES.ingotCharge)
  ratesStore.setPlainCharge(DEFAULT_VALUES.plainCharge)
  ratesStore.setFancyCharge(DEFAULT_VALUES.fancyCharge)
  ratesStore.setLuxuriousCharge(DEFAULT_VALUES.luxuriousCharge)
  colorMode.preference = 'system'

  isResetModalOpen.value = false

  toast.add({
    title: 'تمت استعادة الإعدادات الافتراضية',
    description: 'تمت إعادة ضبط جميع القيم إلى حالتها القياسية.',
    color: 'warning',
    icon: 'i-lucide-rotate-ccw'
  })
}

// دالة تحديث بيانات الشبكة والأسعار
const handleClearCache = () => {
  ratesStore.fetchRates()
  toast.add({
    title: 'تم تحديث البيانات',
    description: 'تمت إعادة جلب أسعار الذهب والصرف فورياً.',
    color: 'info',
    icon: 'i-lucide-refresh-cw'
  })
}
</script>

<template>
  <div class="px-4 pb-12 max-w-2xl mx-auto">
    <!-- الهيدر الرئيسي -->
    <div class="flex items-center justify-between my-5">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-settings"
          class="w-6 h-6 text-amber-500"
        />
        <h1 class="text-2xl font-black">
          إعدادات التطبيق
        </h1>
      </div>
    </div>

    <div class="space-y-6">
      <!-- 1. إعدادات المظهر والثيم -->
      <UCard class="p-2 shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 font-bold text-base">
            <UIcon
              name="i-lucide-palette"
              class="w-5 h-5 text-amber-500"
            />
            مظهر التطبيق
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-muted">نمط الألوان:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="theme in themeOptions"
                :key="theme.value"
                type="button"
                class="py-2 px-3 rounded-lg text-sm font-medium border flex items-center justify-center gap-2 transition-all"
                :class="colorMode.preference === theme.value
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-surface border-accented hover:border-amber-400'"
                @click="colorMode.preference = theme.value"
              >
                <UIcon
                  :name="theme.icon"
                  class="w-4 h-4"
                />
                {{ theme.label }}
              </button>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 2. إعدادات الحسابات والذهب الافتراضية -->
      <UCard class="p-2 shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 font-bold text-base">
            <UIcon
              name="i-lucide-calculator"
              class="w-5 h-5 text-amber-500"
            />
            التفضيلات الافتراضية للحاسبة
          </div>
        </template>

        <div class="space-y-5">
          <!-- العيار الافتراضي -->
          <div>
            <label class="block text-sm font-medium mb-2 text-muted">العيار الافتراضي عند فتح التطبيق:</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="item in karatOptions"
                :key="item.value"
                type="button"
                class="py-2 px-2 rounded-lg text-sm font-semibold border transition-all"
                :class="defaultKarat === item.value
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-surface border-accented hover:border-amber-400'"
                @click="setKarat(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- تفعيل الضريبة تلقائياً -->
          <div class="flex items-center justify-between p-3 border border-accented rounded-lg bg-surface">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-receipt"
                class="w-5 h-5 text-muted"
              />
              <span class="text-sm font-medium">تفعيل ضريبة القيمة المضافة (15%) تلقائياً</span>
            </div>
            <USwitch v-model="autoVat" />
          </div>
        </div>
      </UCard>

      <!-- 3. تخصيص أسعار المصنعية التقديرية (افتراضيات) -->
      <UCard class="p-2 shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 font-bold text-base">
            <UIcon
              name="i-lucide-hammer"
              class="w-5 h-5 text-amber-500"
            />
            قيم المصنعية الافتراضية (ر.س/جرام)
          </div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-muted mb-1">السبائك والجنيهات:</label>
            <UInput
              v-model.number="ingotCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">مشغولات سادة / خفيفة:</label>
            <UInput
              v-model.number="plainCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">مشغولات منقوشة / زركون:</label>
            <UInput
              v-model.number="fancyCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">أطقم فاخرة / مناسبات:</label>
            <UInput
              v-model.number="luxuriousCharge"
              type="number"
              min="0"
            />
          </div>
        </div>
      </UCard>

      <!-- 4. بيانات العملة والصرف المعتمدة -->
      <UCard class="p-2 shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 font-bold text-base">
            <UIcon
              name="i-lucide-dollar-sign"
              class="w-5 h-5 text-amber-500"
            />
            أسعار الصرف والشبكة
          </div>
        </template>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center text-muted">
            <span>سعر صرف الدولار مقابل الريال:</span>
            <span class="font-bold text-foreground">{{ usdToSar ? `${usdToSar} ر.س` : '3.75 ر.س' }}</span>
          </div>

          <USeparator />

          <div class="flex justify-between items-center">
            <span class="text-xs text-muted">تحديث بيانات الأسعار يدوياً:</span>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-lucide-refresh-cw"
              @click="handleClearCache"
            >
              تحديث الأسعار الآن
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- أزرار الحفظ والإعادة -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-save"
          class="font-bold"
          @click="handleSaveSettings"
        >
          حفظ التغييرات
        </UButton>

        <UButton
          block
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          class="font-bold"
          @click="isResetModalOpen = true"
        >
          استعادة الافتراضيات
        </UButton>
      </div>
    </div>

    <!-- Modal تأكيد استعادة الافتراضيات -->
    <UModal
      v-model:open="isResetModalOpen"
      title="تأكيد استعادة الافتراضيات"
      description="هل أنت أصلًا متاكد من رغبتك في إعادة ضبط كافة إعدادات التطبيق والمصنعيات إلى القيم القياسية؟"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="outline"
            @click="isResetModalOpen = false"
          >
            إلغاء
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-rotate-ccw"
            @click="confirmResetDefaults"
          >
            تأكيد الإعادة
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
