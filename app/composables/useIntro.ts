const INTRO_KEY = 'gold-app-intro-shown'

export const useIntro = () => {
  const hasShownIntro = ref(false)

  if (import.meta.client) {
    const stored = localStorage.getItem(INTRO_KEY)
    if (stored !== null) {
      hasShownIntro.value = stored === 'true'
    }
  }

  const isIntroVisible = ref(hasShownIntro.value)

  const markIntroAsShown = () => {
    hasShownIntro.value = true
    if (import.meta.client) {
      localStorage.setItem(INTRO_KEY, 'true')
    }
  }

  const resetIntro = () => {
    hasShownIntro.value = false
    isIntroVisible.value = false
    if (import.meta.client) {
      localStorage.setItem(INTRO_KEY, 'false')
    }
  }

  return {
    hasShownIntro,
    isIntroVisible,
    markIntroAsShown,
    resetIntro
  }
}
