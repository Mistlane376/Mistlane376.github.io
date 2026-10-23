// Serve third-party libraries from the locally vendored /vendor files and
// fall back to the public CDN when one fails to load. The local copies are
// produced by tools/vendor-assets.js, so the CDN is a safety net only.
const FALLBACKS = new Map([
  ['/vendor/typed/typed.umd.min.js', 'https://cdn.jsdelivr.net/npm/typed.js@3.0.0/dist/typed.umd.min.js'],
  ['/vendor/infinitegrid/infinitegrid.min.js', 'https://cdn.jsdelivr.net/npm/@egjs/infinitegrid@4.13.0/dist/infinitegrid.min.js'],
  ['/vendor/sharejs/js/social-share.min.js', 'https://cdn.jsdelivr.net/npm/butterfly-extsrc@1.1.6/sharejs/dist/js/social-share.min.js'],
  ['/vendor/sharejs/css/share.min.css', 'https://cdn.jsdelivr.net/npm/butterfly-extsrc@1.1.6/sharejs/dist/css/share.min.css']
])

const swapSource = element => {
  const attribute = element.tagName === 'LINK' ? 'href' : 'src'
  const raw = element.getAttribute(attribute)
  if (!raw) return false

  let pathname
  try {
    pathname = new URL(raw, document.baseURI).pathname
  } catch (error) {
    return false
  }

  const cdn = FALLBACKS.get(pathname)
  if (!cdn) return false

  FALLBACKS.delete(pathname)
  element.setAttribute(attribute, cdn)
  return true
}

window.addEventListener('error', event => {
  const element = event.target
  if (!element || (element.tagName !== 'SCRIPT' && element.tagName !== 'LINK')) return
  // Swapping in the capture phase keeps btf.getScript's promise pending until
  // the CDN copy loads, so callers resolve normally instead of failing.
  if (swapSource(element)) event.stopPropagation()
}, true)
