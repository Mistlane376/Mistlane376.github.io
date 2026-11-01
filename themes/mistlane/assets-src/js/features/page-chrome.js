import { onMount } from '../lib/lifecycle'

const navLinkSelector = '#nav .menus_items a.site-page[href]'

let progressBar = null
let progressFrame = 0

const normalizePath = value => {
  const path = value.replace(/\/index\.html$/, '/').replace(/\/+$/, '')
  return path || '/'
}

const syncNavCurrent = () => {
  const current = normalizePath(window.location.pathname)
  document.querySelectorAll(navLinkSelector).forEach(link => {
    const target = normalizePath(new URL(link.getAttribute('href'), window.location.origin).pathname)
    const active = target === current || (target !== '/' && current.startsWith(`${target}/`))
    link.classList.toggle('is-current', active)
    if (active) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
  document.querySelectorAll('#nav .menus_item').forEach(item => {
    const child = item.querySelector('.menus_item_child')
    item.classList.toggle('has-current', Boolean(child?.querySelector('a.is-current')))
  })
}

const ensureProgressBar = () => {
  if (progressBar?.isConnected) return progressBar
  progressBar = document.createElement('div')
  progressBar.className = 'mistlane-reading-progress'
  progressBar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(progressBar)
  return progressBar
}

const updateReadingProgress = () => {
  progressFrame = 0
  const bar = ensureProgressBar()
  const body = document.getElementById('body-wrap')
  const article = document.getElementById('article-container')
  if (!body?.classList.contains('post') || !article) {
    bar.style.setProperty('--reading-progress', '0')
    bar.classList.remove('is-active')
    return
  }

  const rect = article.getBoundingClientRect()
  const start = rect.top + window.scrollY
  const end = start + article.offsetHeight - window.innerHeight
  const raw = end > start ? (window.scrollY - start) / (end - start) : 0
  const progress = Math.min(1, Math.max(0, raw))
  bar.style.setProperty('--reading-progress', progress.toFixed(4))
  bar.classList.toggle('is-active', progress > 0.004)
}

const scheduleProgress = () => {
  if (progressFrame) return
  progressFrame = window.requestAnimationFrame(updateReadingProgress)
}

window.addEventListener('scroll', scheduleProgress, { passive: true })
window.addEventListener('resize', scheduleProgress, { passive: true })

onMount(() => {
  syncNavCurrent()
  ensureProgressBar()
  scheduleProgress()
})
