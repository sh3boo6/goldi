export const useGoldPrice = () => {
  const getGoldPriceUSD = async () => {
    try {
      // نطلب البيانات من سيرفرنا الداخلي مجاناً وبدون أي مشاكل CORS
      const data = await $fetch('/api/gold')
      return data
    } catch (error) {
      console.error('Error fetching gold price:', error)
      return {
        ounceUSD: 0,
        gram24USD: 0,
        gram21USD: 0,
        gram18USD: 0
      }
    }
  }

  return { getGoldPriceUSD }
}
