<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

// 1. استخدام متجر الأسعار
const ratesStore = useRatesStore()
const { usdToSar, defaultKarat, autoVat, ingotCharge, plainCharge, fancyCharge, luxuriousCharge } = storeToRefs(ratesStore)

// 2. التحكم في المظهر (Light / Dark / System)
const colorMode = useColorMode()
const toast = useToast()
const { t } = useI18n()

// 3. إعدادات اللغة
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const setLocale = (code: 'ar' | 'en' | 'fr' | 'es') => {
  const cookie = useCookie('i18n_redirected')
  cookie.value = code
  navigateTo(switchLocalePath(code))
}

// عند تغيير العيار في الإعدادات
const setKarat = (karat: number) => {
  ratesStore.setDefaultKarat(karat)
}

// 4. القيم القياسية للتطبيق (الافتراضيات)
const DEFAULT_VALUES = {
  karat: 21,
  autoVat: true,
  ingotCharge: 15,
  plainCharge: 30,
  fancyCharge: 50,
  luxuriousCharge: 80
}

// 5. الحالات التفاعلية
const isResetModalOpen = ref<boolean>(false)

// خيارات العيار الافتراضي
const karatOptions = computed(() => [
  { label: t('buy.karat24'), value: 24 },
  { label: t('buy.karat22'), value: 22 },
  { label: t('buy.karat21'), value: 21 },
  { label: t('buy.karat18'), value: 18 }
])

const themeOptions = computed(() => [
  { label: t('settings.light'), value: 'light', icon: 'i-lucide-sun' },
  { label: t('settings.dark'), value: 'dark', icon: 'i-lucide-moon' },
  { label: t('settings.system'), value: 'system', icon: 'i-lucide-laptop' }
])

// دالة حفظ الإعدادات
const handleSaveSettings = () => {
  toast.add({
    title: t('settings.saveSuccessTitle'),
    description: t('settings.saveSuccessDesc'),
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
    title: t('settings.resetSuccessTitle'),
    description: t('settings.resetSuccessDesc'),
    color: 'warning',
    icon: 'i-lucide-rotate-ccw'
  })
}

// دالة تحديث بيانات الشبكة والأسعار
const handleClearCache = () => {
  ratesStore.fetchRates()
  toast.add({
    title: t('settings.updateSuccessTitle'),
    description: t('settings.updateSuccessDesc'),
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
          {{ t('settings.title') }}
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
            {{ t('settings.appearance') }}
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-muted">{{ t('settings.colorModeLabel') }}</label>
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

      <!-- Language Switcher -->
      <UCard class="p-2 shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 font-bold text-base">
            <UIcon
              name="i-lucide-globe"
              class="w-5 h-5 text-amber-500"
            />
            {{ t('settings.language') }}
          </div>
        </template>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="loc in locales"
            :key="loc.code"
            type="button"
            class="py-2.5 px-2 rounded-lg text-sm font-semibold border transition-all"
            :class="locale === loc.code
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-surface border-accented hover:border-amber-400'"
            @click="setLocale(loc.code)"
          >
            {{ loc.name }}
          </button>
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
            {{ t('settings.calculatorDefaults') }}
          </div>
        </template>

        <div class="space-y-5">
          <!-- العيار الافتراضي -->
          <div>
            <label class="block text-sm font-medium mb-2 text-muted">{{ t('settings.defaultKaratLabel') }}</label>
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
              <span class="text-sm font-medium">{{ t('settings.autoVatLabel') }}</span>
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
            {{ t('settings.makingCharges') }}
          </div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-muted mb-1">{{ t('settings.ingotLabel') }}</label>
            <UInput
              v-model.number="ingotCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">{{ t('settings.plainLabel') }}</label>
            <UInput
              v-model.number="plainCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">{{ t('settings.fancyLabel') }}</label>
            <UInput
              v-model.number="fancyCharge"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">{{ t('settings.luxuriousLabel') }}</label>
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
            {{ t('settings.exchangeNetwork') }}
          </div>
        </template>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center text-muted">
            <span>{{ t('settings.usdRate') }}</span>
            <span class="font-bold text-foreground">{{ usdToSar ? t('settings.usdRateValue', { n: usdToSar }) : t('settings.usdRateValue', { n: 3.75 }) }}</span>
          </div>

          <USeparator />

          <div class="flex justify-between items-center">
            <span class="text-xs text-muted">{{ t('settings.manualUpdate') }}</span>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-lucide-refresh-cw"
              @click="handleClearCache"
            >
              {{ t('settings.updateNow') }}
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
          {{ t('settings.saveChanges') }}
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
          {{ t('settings.restoreDefaults') }}
        </UButton>
      </div>
    </div>

    <!-- Modal تأكيد استعادة الافتراضيات -->
    <UModal
      v-model:open="isResetModalOpen"
      :title="t('settings.resetTitle')"
      :description="t('settings.resetDesc')"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="outline"
            @click="isResetModalOpen = false"
          >
            {{ t('settings.cancel') }}
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-rotate-ccw"
            @click="confirmResetDefaults"
          >
            {{ t('settings.confirmReset') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
