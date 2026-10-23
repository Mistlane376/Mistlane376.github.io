// PJAX-aware asset loader.
//
// The Hexo helper (themes/mistlane/scripts/helpers/mistlane_assets.js)
// renders the bundles a page needs into the initial HTML and writes their
// urls into a marker inside #body-wrap. Because PJAX swaps #body-wrap, the
// marker is always fresh: after navigation this loader reads it and pulls
// in any bundle that is not loaded yet.
const MARKER_ID = 'mistlane-page-bundles'

const readBundles = () => {
  const marker = document.getElementById(MARKER_ID)
  if (!marker) return { js: {}, css: {} }
  try {
    const parsed = JSON.parse(marker.dataset.bundles || '{}')
    return { js: parsed.js || {}, css: parsed.css || {} }
  } catch (error) {
    console.error('[mistlane] invalid page bundle marker:', error)
    return { js: {}, css: {} }
  }
}

const loadScript = (name, url) => {
  if (!url || document.querySelector(`script[data-mistlane="${name}"]`)) return
  const load = window.btf?.getScript
    ? window.btf.getScript(url, { 'data-mistlane': name })
    : new Promise(resolve => {
      const script = document.createElement('script')
      script.src = url
      script.dataset.mistlane = name
      script.onload = resolve
      document.body.appendChild(script)
    })
  load.catch(error => console.error(`[mistlane] bundle ${name} failed to load:`, error))
}

const loadStyle = (name, url) => {
  if (!url || document.getElementById(`mistlane-css-${name}`)) return
  if (window.btf?.getCSS) {
    window.btf.getCSS(url, `mistlane-css-${name}`).catch(error => console.error(`[mistlane] style ${name} failed to load:`, error))
    return
  }
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.id = `mistlane-css-${name}`
  document.head.appendChild(link)
}

export const ensurePageAssets = () => {
  const bundles = readBundles()
  Object.entries(bundles.js).forEach(([name, url]) => loadScript(name, url))
  Object.entries(bundles.css).forEach(([name, url]) => loadStyle(name, url))
}

// The initial document already carries its own tags, so the loader only has
// to act on PJAX navigation (and never counts or re-fetches anything).
export const watchPageAssets = () => {
  ensurePageAssets()
  document.addEventListener('pjax:complete', ensurePageAssets)
}
