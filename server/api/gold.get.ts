interface YahooFinanceResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
      }
    }>
  }
}

interface GoldApiResponse {
  price?: number
}

interface FrankfurterResponse {
  rates?: {
    SAR?: number
  }
}

export default defineEventHandler(async () => {
  let currentPricePerOunce = 0
  let usdToSarRate = 3.75

  // 1. محاولة جلب سعر أونصة الذهب من Yahoo Finance
  try {
    const goldData = await $fetch<YahooFinanceResponse>(
      'https://query1.finance.yahoo.com/v8/finance/chart/GC=F',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      }
    )
    const meta = goldData?.chart?.result?.[0]?.meta
    currentPricePerOunce = meta?.regularMarketPrice || 0
  } catch (err) {
    console.warn('Yahoo Finance fetch failed, attempting fallback...', err)
  }

  // المصدر الاحتياطي لسعر أونصة الذهب باستخدام واجهة GoldApiResponse بدلاً من any
  if (!currentPricePerOunce) {
    try {
      const fallbackData = await $fetch<GoldApiResponse>('https://api.gold-api.com/price/XAU')
      if (fallbackData?.price) {
        currentPricePerOunce = fallbackData.price
      }
    } catch (fallbackErr) {
      console.warn('Fallback Gold API failed as well:', fallbackErr)
    }
  }

  // 2. جلب سعر صرف الريال السعودي مقابل الدولار
  try {
    const ratesData = await $fetch<FrankfurterResponse>('https://api.frankfurter.app/latest', {
      query: { from: 'USD', to: 'SAR' }
    })
    if (ratesData?.rates?.SAR) {
      usdToSarRate = ratesData.rates.SAR
    }
  } catch (err) {
    console.warn('Frankfurter API fetch failed, using default SAR rate (3.75):', err)
  }

  // حساب أسعار الجرامات
  const pricePerGramUSD = currentPricePerOunce > 0 ? currentPricePerOunce / 31.1035 : 0

  return {
    usdToSar: usdToSarRate,
    ounceUSD: currentPricePerOunce,
    gram24USD: pricePerGramUSD,
    gram24SAR: pricePerGramUSD * usdToSarRate,
    gram21SAR: (pricePerGramUSD * (21 / 24)) * usdToSarRate,
    gram18SAR: (pricePerGramUSD * (18 / 24)) * usdToSarRate
  }
})
