(() => {
  'use strict'
  if (document.documentElement.dataset.rssBound === 'true') return
  document.documentElement.dataset.rssBound = 'true'
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-rss-copy]')
    if (!button) return
    const target = document.querySelector(button.dataset.rssCopy)
    if (!target) return
    const value = target.textContent.trim()
    const done = () => {
      const status = document.querySelector('[data-rss-status]')
      if (status) status.textContent = '订阅地址已复制'
      const label = button.querySelector('span')
      if (label) { label.textContent = '已复制'; setTimeout(() => { label.textContent = '复制地址' }, 1800) }
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(done).catch(() => {})
    else { const range = document.createRange(); range.selectNodeContents(target); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); try { document.execCommand('copy'); done() } finally { selection.removeAllRanges() } }
  })
})()
