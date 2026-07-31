(() => {
  const installSearchAnimations = () => {
    if (!window.btf || !window.btf.animateIn || !window.btf.animateOut) return

    const originalAnimateIn = window.btf.animateIn
    const originalAnimateOut = window.btf.animateOut
    const isSearchLayer = element => element && (element.id === 'search-mask' || element.closest('#local-search'))

    window.btf.animateIn = (element, animation) => {
      if (!isSearchLayer(element)) return originalAnimateIn(element, animation)
      element.style.display = 'block'
      element.style.animation = 'search-panel-in 160ms ease-out both'
    }

    window.btf.animateOut = (element, animation) => {
      if (!isSearchLayer(element)) return originalAnimateOut(element, animation)

      const handleAnimationEnd = () => {
        element.style.display = ''
        element.style.animation = ''
        element.removeEventListener('animationend', handleAnimationEnd)
      }

      element.addEventListener('animationend', handleAnimationEnd)
      element.style.animation = 'search-panel-out 120ms ease-in both'
    }
  }

  // The theme registers search handlers on load; patch its animation helpers beforehand.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installSearchAnimations, { once: true })
  } else {
    installSearchAnimations()
  }
})()
