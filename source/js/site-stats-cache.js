(() => {
  'use strict'

  const cacheKey = 'mistlane-site-stats'
  const ids = ['busuanzi_value_site_uv', 'busuanzi_value_site_pv']
  const elements = () => ids.map((id) => document.getElementById(id)).filter(Boolean)

  const readCache = () => {
    try {
      return JSON.parse(localStorage.getItem(cacheKey)) || {}
    } catch (_) {
      return {}
    }
  }

  const writeCache = (value) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(value))
    } catch (_) {
      // Statistics remain usable when storage is unavailable.
    }
  }

  const cached = readCache()
  const refresh = () => {
    const next = { ...cached }
    elements().forEach((element) => {
      const value = element.textContent.trim()
      if (value && !element.querySelector('.fa-spinner')) next[element.id] = value
    })
    if (Object.keys(next).length) writeCache(next)
  }

  const showCachedValues = () => {
    elements().forEach((element) => {
      if (cached[element.id]) element.textContent = cached[element.id]
    })
  }

  showCachedValues()
  const observer = new MutationObserver(refresh)
  observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true })

  window.setTimeout(() => {
    elements().forEach((element) => {
      if (element.querySelector('.fa-spinner')) {
        element.textContent = cached[element.id] || '--'
        element.title = '统计服务响应较慢，将在可用时自动更新'
      }
    })
  }, 3500)
})()
