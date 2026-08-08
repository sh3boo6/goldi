export const useFrankfurter = () => {
  const baseUrl = 'https://api.frankfurter.app'

  type FrankfurterRatesResponse = {
    amount: number
    base: string
    date: string
    rates: Record<string, number>
  }

  // جلب أحدث أسعار الصرف باستخدام $fetch
  const getLatestRates = async (from: string = 'USD', to: string = 'SAR') => {
    try {
      const data = await $fetch<FrankfurterRatesResponse>(`${baseUrl}/latest`, {
        query: { from, to }
      })
      return data
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      return null
    }
  }

  return { getLatestRates }
}
