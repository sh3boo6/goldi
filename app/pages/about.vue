<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t } = useI18n()

// 1. الاتصال بمتجر الأسعار للتحقق من الاتصال
const online = useOnline()
const ratesStore = useRatesStore()
const { lastUpdated } = storeToRefs(ratesStore)

// مميزات التطبيق الرئيسية
const features = [
  {
    title: t('about.feature1Title'),
    description: t('about.feature1Desc'),
    icon: 'i-lucide-activity',
    color: 'amber'
  },
  {
    title: t('about.feature2Title'),
    description: t('about.feature2Desc'),
    icon: 'i-lucide-shield-check',
    color: 'emerald'
  },
  {
    title: t('about.feature3Title'),
    description: t('about.feature3Desc'),
    icon: 'i-lucide-calculator',
    color: 'blue'
  },
  {
    title: t('about.feature4Title'),
    description: t('about.feature4Desc'),
    icon: 'i-lucide-wifi-off',
    color: 'purple'
  }
]

// خطوات معالجة وحساب السعر العادل
const steps = [
  {
    step: '1',
    title: t('about.step1Title'),
    description: t('about.step1Desc')
  },
  {
    step: '2',
    title: t('about.step2Title'),
    description: t('about.step2Desc')
  },
  {
    step: '3',
    title: t('about.step3Title'),
    description: t('about.step3Desc')
  }
]
// use nuxt ui
const socialLogos = [
  {
    src: '/img/avatar.png',
    alt: 'me'
  },
  {
    'icon': 'i-simple-icons-github',
    'to': 'https://github.com/sh3boo6',
    'target': '_blank',
    'aria-label': 'GitHub'
  },
  {
    'icon': 'i-simple-icons-whatsapp',
    'to': 'https://wa.me/966507770383',
    'target': '_blank',
    'aria-label': 'Discord'
  },
  {
    'icon': 'i-simple-icons-x',
    'to': 'https://x.com/sh3boo6',
    'target': '_blank',
    'aria-label': 'X (Twitter)'
  },
  {
    'icon': 'i-simple-icons-instagram',
    'to': 'https://instagram.com/sh3boo61',
    'target': '_blank',
    'aria-label': 'Instagram'
  },
  {
    'icon': 'i-simple-icons-snapchat',
    'to': 'https://snapchat.com/t/vqDp4oNM',
    'target': '_blank',
    'aria-label': 'Snapchat'
  },
  {
    'icon': 'i-simple-icons-facebook',
    'to': 'https://facebook.com/sh3boo6',
    'target': '_blank',
    'aria-label': 'Facebook'
  }
]

onMounted(() => {
  if (online.value && !lastUpdated.value) {
    ratesStore.fetchRates()
  }
})
</script>

<template>
  <div class="px-4 pb-12 max-w-3xl mx-auto space-y-8">
    <!-- الهيدر والترحيب -->
    <div class="text-center my-8 space-y-3">
      <div class="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-2">
        <img
          src="/img/logo.png"
          alt="شعار برنامج الذهب"
          class="w-12 h-12"
        >
      </div>
      <h1 class="text-3xl font-black text-foreground">
        {{ t('about.title') }}
      </h1>
      <p class="text-muted max-w-xl mx-auto text-sm leading-relaxed">
        {{ t('about.subtitle') }}
      </p>
    </div>

    <!-- رؤية التطبيق -->
    <UCard class="p-2 shadow-sm border-amber-500/20 bg-amber-500/5">
      <div class="flex items-start gap-4 p-2">
        <UIcon
          name="i-lucide-sparkles"
          class="w-8 h-8 text-amber-500 shrink-0 mt-1"
        />
        <div class="space-y-1">
          <h2 class="text-lg font-bold text-foreground">
            {{ t('about.visionTitle') }}
          </h2>
          <p class="text-sm text-muted leading-relaxed">
            {{ t('about.visionText') }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- مميزات التطبيق -->
    <div class="space-y-4">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <UIcon
          name="i-lucide-star"
          class="w-5 h-5 text-amber-500"
        />
        {{ t('about.whyUs') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard
          v-for="feat in features"
          :key="feat.title"
          class="p-2 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <div class="p-2.5 rounded-xl bg-surface border border-accented">
              <UIcon
                :name="feat.icon"
                class="w-6 h-6 text-amber-500"
              />
            </div>
            <div>
              <h3 class="font-bold text-base">
                {{ feat.title }}
              </h3>
              <p class="text-xs text-muted mt-1 leading-normal">
                {{ feat.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- آلية حساب السعر العادل -->
    <UCard class="p-2 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2 font-bold text-lg">
          <UIcon
            name="i-lucide-cpu"
            class="w-5 h-5 text-amber-500"
          />
          {{ t('about.howTitle') }}
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="(st, index) in steps"
          :key="st.step"
          class="flex items-start gap-4"
        >
          <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
            {{ st.step }}
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-sm">
              {{ st.title }}
            </h4>
            <p class="text-xs text-muted">
              {{ st.description }}
            </p>
          </div>
          <USeparator
            v-if="index < steps.length - 1"
            class="my-2"
          />
        </div>
      </div>
    </UCard>

    <!-- تنبيه إخلاء المسؤولية -->
    <div class="p-4 rounded-xl bg-surface border border-accented text-xs text-muted space-y-2">
      <div class="flex items-center gap-2 font-bold text-foreground text-sm">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-4 h-4 text-amber-500"
        />
        {{ t('about.disclaimerTitle') }}
      </div>
      <p class="leading-relaxed">
        {{ t('about.disclaimerText') }}
      </p>
    </div>

    <UPageLogos marquee>
      <ULink
        v-for="social in socialLogos"
        :key="social.to"
        :to="social.to"
        target="_blank"
        :aria-label="social['aria-label']"
      >
        <UAvatar
          v-if="social.src"
          size="2xl"
          :src="social.src"
          :alt="social.alt"
        />
        <UIcon
          v-else
          :name="social.icon"
          class="size-10"
        />

      </ULink>
    </UPageLogos>

    <!-- معلومات الإصدار والتواصل -->
    <div class="text-center pt-4 text-xs text-muted space-y-2">
      <p>{{ t('about.version') }}</p>
      <p>{{ t('about.copyright', { year: new Date().getFullYear() }) }}</p>
    </div>
  </div>
</template>
