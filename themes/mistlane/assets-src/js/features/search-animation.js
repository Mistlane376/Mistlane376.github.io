// Patch the theme's search panel animations before its own handlers run, and
// defer loading /js/search/local-search.js until the panel is first opened.
// The theme binds its open handler from inside that script, so the first
// click is intercepted, the script is injected and the click is replayed.
const installSearchAnimations = () => {
  if (!window.btf || !window.btf.animateIn || !window.btf.animateOut) return
  if (window.btf.__mistlaneSearchPatched) return
  window.btf.__mistlaneSearchPatched = true

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

const searchScript = { loaded: false, loading: null }

const loadSearchScript = () => {
  if (searchScript.loaded) return Promise.resolve()
  if (searchScript.loading) return searchScript.loading

  const panel = document.getElementById('local-search')
  const url = panel && panel.dataset.script
  if (!url) return Promise.resolve()

  searchScript.loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => {
      searchScript.loaded = true
      resolve()
    }
    script.onerror = () => {
      searchScript.loading = null
      reject(new Error(`Failed to load ${url}`))
    }
    document.body.appendChild(script)
  }).catch(error => {
    console.error('Failed to load the local search script:', error)
  })

  return searchScript.loading
}

const installSearchLazyLoad = () => {
  // Prefetch when the pointer approaches the button so the click feels instant.
  document.addEventListener('pointerover', event => {
    const target = event.target
    if (target instanceof Element && target.closest('#search-button')) loadSearchScript()
  }, { capture: true, passive: true })

  document.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Element) || searchScript.loaded) return

    const button = target.closest('#search-button > .search')
    if (!button) return

    event.preventDefault()
    event.stopImmediatePropagation()
    loadSearchScript().then(() => {
      if (searchScript.loaded) button.click()
    })
  }, true)
}

const boot = () => {
  installSearchAnimations()
  installSearchLazyLoad()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
