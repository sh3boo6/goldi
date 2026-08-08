export const useArabicNumbers = () => {
  const ARABIC_DIGITS = /[٠-٩]/g

  const toWestern = (value: string | number): string | number => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return value
    return value.replace(ARABIC_DIGITS, d => String.fromCharCode(d.charCodeAt(0) - 0x660 + 0x30))
  }

  const sanitizeNumberInput = (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return value
    const western = toWestern(value) as string
    if (western === '' || western === '-') return null
    const parsed = Number(western)
    return isNaN(parsed) ? null : parsed
  }

  return { toWestern, sanitizeNumberInput }
}
