// composables/useGoldCalculator.ts

export type GoldCategory = 'ingot' | 'plain' | 'fancy' | 'luxurious'

export const useGoldCalculator = () => {
  /**
   * حساب سعر المصنعية التقديري للجرام تلقائياً بناءً على نوع القطعة والوزن
   */
  const calculateAutoMakingCharge = (category: GoldCategory, weight: number): number => {
    let baseCharge = 30 // السعر الافتراضي للجرام

    switch (category) {
      case 'ingot': // سبائك وجنيهات
        baseCharge = 15
        break
      case 'plain': // مشغولات سادة (خواتم/سلاسل بسيطة)
        baseCharge = 30
        break
      case 'fancy': // مشغولات بها نقش أو زركون
        baseCharge = 50
        break
      case 'luxurious': // أطقم فاخرة وسوليتير
        baseCharge = 80
        break
    }

    // خصم تلقائي للوزن العالي (مثلاً خصم 10% لكل 50 جرام)
    if (weight > 50) {
      baseCharge *= 0.85 // خصم 15% على أجور المصنعية للكميات الكبيرة
    } else if (weight > 20) {
      baseCharge *= 0.90 // خصم 10%
    }

    return Math.round(baseCharge)
  }

  return { calculateAutoMakingCharge }
}
