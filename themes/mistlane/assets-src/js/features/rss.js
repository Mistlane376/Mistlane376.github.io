import { onMount } from '../lib/lifecycle'

// Delegated copy handler for the /rss/ page; installed once per document.
onMount(() => {
  if (document.documentElement.dataset.rssBound === 'true') return
  document.documentElement.dataset.rssBound = 'true'
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-rss-copy]')
    if (!button) return
    const target = document.querySelector(button.dataset.rssCopy)
    if (!target) return
    const box = button.closest('.rss-feed-box') || document
    const value = target.textContent.trim()
    const done = () => {
      const status = box.querySelector('[data-rss-status]')
      if (status) status.textContent = '订阅地址已复制'
      const label = button.querySelector('span')
      if (label) { label.textContent = '已复制'; setTimeout(() => { label.textContent = '复制地址' }, 1800) }
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(done).catch(() => {})
    else {
      const range = document.createRange()
      range.selectNodeContents(target)
      const selection = getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      try { document.execCommand('copy'); done() } finally { selection.removeAllRanges() }
    }
  })
})
