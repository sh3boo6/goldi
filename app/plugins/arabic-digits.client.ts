export default defineNuxtPlugin({
  enforce: 'client',
  setup() {
    if (typeof document === 'undefined') return

    const ARABIC_DIGITS = /[٠-٩]/g
    const ARABIC_DECIMAL = /٫/g

    const toWestern = (value: string): string =>
      value
        .replace(ARABIC_DIGITS, d => String.fromCharCode(d.charCodeAt(0) - 0x660 + 0x30))
        .replace(ARABIC_DECIMAL, '.')

    let converting = false

    document.addEventListener('input', (event: Event) => {
      if (converting) return
      const target = event.target as HTMLInputElement
      if (!target || target.tagName !== 'INPUT') return
      if (!/^(text|number|search|tel|url|password|email)$/.test(target.type)) return

      const original = target.value
      const converted = toWestern(original)
      if (original === converted) return

      converting = true
      const start = target.selectionStart ?? 0
      const end = target.selectionEnd ?? 0
      const originalLength = original.length

      target.value = converted

      const newLength = converted.length
      const delta = newLength - originalLength
      const newStart = start + delta
      const newEnd = end + delta

      try {
        target.setSelectionRange(newStart, newEnd)
      } catch {
        // Ignore selection restore errors
      }

      target.dispatchEvent(new Event('input', { bubbles: true }))
      converting = false
    })
  }
})
