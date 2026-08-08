import { defineStore } from 'pinia'

export const useRatesStore = defineStore('rates', {
  state: () => ({
    usdToSar: 3.75,
    goldGram24SAR: 0,
    lastUpdated: null as Date | null,
    // العيار الافتراضي للتطبيق
    defaultKarat: 21,
    autoVat: true,
    ingotCharge: 15,
    plainCharge: 30,
    fancyCharge: 50,
    luxuriousCharge: 80
  }),

  getters: {
    goldGram22SAR: state => state.goldGram24SAR * (22 / 24),
    goldGram21SAR: state => state.goldGram24SAR * (21 / 24),
    goldGram18SAR: state => state.goldGram24SAR * (18 / 24),
    goldGram14SAR: state => state.goldGram24SAR * (14 / 24)
  },

  actions: {
    async fetchRates() {
      try {
        const data = await $fetch('/api/gold')

        if (data && data.gram24SAR > 0) {
          this.usdToSar = data.usdToSar
          this.goldGram24SAR = data.gram24SAR
          this.lastUpdated = new Date()
        }
      } catch (error) {
        console.error('Error fetching rates from local API:', error)
      }
    },

    setDefaultKarat(karat: number) {
      this.defaultKarat = karat
    },

    setAutoVat(value: boolean) {
      this.autoVat = value
    },

    setIngotCharge(value: number) {
      this.ingotCharge = value
    },

    setPlainCharge(value: number) {
      this.plainCharge = value
    },

    setFancyCharge(value: number) {
      this.fancyCharge = value
    },

    setLuxuriousCharge(value: number) {
      this.luxuriousCharge = value
    }
  }
})
