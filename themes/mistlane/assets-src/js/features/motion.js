import { onMount } from '../lib/lifecycle'

// Below-the-fold sections get a small, one-shot entrance. Elements that are
// already visible when the page mounts are left untouched, so the enhancement
// never causes a flash of hidden content.
const revealSelector = [
  '#recent-posts .recent-post-item',
  '#archive .article-sort-item',
  '.home-bento > *',
  '.home-hero-bridge',
  '.home-latest-heading',
  '.about-section',
  '.about-contact',
  '.about-facts > div',
  '.about-site-grid article',
  '.category-detail-intro',
  '.type-guestbook .guestbook-message',
  '.type-link .link-directory-section-heading',
  '.type-link .link-exchange',
  '#article-container > h2',
  '#article-container > h3',
  '#article-container > blockquote',
  '#article-container > figure',
  '#article-container > .table-container',
  '#post .post-copyright',
  '#post .tag_share',
  '#post .related-posts',
  '#post #post-comment'
].join(',')

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

let revealObserver = null
let scanFrame = 0
let pageObserver = null
const cleanupTimers = new WeakMap()

const reducedMotion = () => reducedMotionQuery.matches || document.documentElement.dataset.reduceMotion === 'true'

const finishReveal = element => {
  if (!element.isConnected) return
  element.classList.remove('motion-pending')
}

const reveal = element => {
  element.classList.add('is-inview')
  revealObserver?.unobserve(element)
  const delay = Number.parseFloat(element.style.getPropertyValue('--motion-delay')) || 0
  window.clearTimeout(cleanupTimers.get(element))
  cleanupTimers.set(element, window.setTimeout(() => finishReveal(element), 800 + delay))
}

const ensureRevealObserver = () => {
  if (revealObserver) return revealObserver
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target)
    })
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 })
  return revealObserver
}

const revealAll = () => {
  revealObserver?.disconnect()
  revealObserver = null
  document.querySelectorAll('.motion-pending').forEach(element => {
    window.clearTimeout(cleanupTimers.get(element))
    element.classList.add('is-inview')
    finishReveal(element)
  })
}

const revealDelayGroups = [
  ['.home-bento > *', 90, 5],
  ['.about-facts > div', 90, 3],
  ['.about-site-grid article', 100, 4]
]

const revealDelay = element => {
  const group = revealDelayGroups.find(([selector]) => element.matches(selector))
  if (!group) return 0
  const siblings = [...element.parentElement.children]
  return Math.min(siblings.indexOf(element), group[2]) * group[1]
}

const scan = () => {
  scanFrame = 0
  if (reducedMotion()) {
    revealAll()
    return
  }

  const observer = ensureRevealObserver()
  document.querySelectorAll(revealSelector).forEach(element => {
    if (element.dataset.motion) return
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.dataset.motion = 'visible'
      return
    }
    const delay = revealDelay(element)
    if (delay) element.style.setProperty('--motion-delay', `${delay}ms`)
    element.dataset.motion = 'pending'
    element.classList.add('motion-pending')
    observer.observe(element)
  })
}

const scheduleScan = () => {
  if (scanFrame) return
  scanFrame = window.requestAnimationFrame(scan)
}

const runPageEnter = () => {
  if (reducedMotion()) return
  const content = document.getElementById('content-inner')
  if (!content) return
  content.classList.remove('motion-page-enter')
  void content.offsetWidth
  content.classList.add('motion-page-enter')
}

const syncPreference = () => {
  if (reducedMotion()) revealAll()
  else scheduleScan()
}

const startPageObserver = () => {
  if (pageObserver) return
  pageObserver = new MutationObserver(scheduleScan)
  pageObserver.observe(document.body, { childList: true, subtree: true })
}

reducedMotionQuery.addEventListener?.('change', syncPreference)
new MutationObserver(syncPreference).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-reduce-motion']
})

onMount(() => {
  if (!('IntersectionObserver' in window)) return
  // Leaving a previous page's pending nodes behind would keep them invisible
  // after a partial PJAX update; reveal them before rebinding the observer.
  revealAll()
  runPageEnter()
  startPageObserver()
  syncPreference()
})

window.MistlaneMotion = { refresh: scheduleScan }
