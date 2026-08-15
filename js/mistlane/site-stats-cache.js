(() => {
  'use strict'

  const cacheKey = 'mistlane-vercount-stats'
  const ids = ['vercount_value_site_uv', 'vercount_value_site_pv', 'vercount_value_page_pv']
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

  let cached = readCache()
  const refresh = () => {
    const next = { ...cached }
    elements().forEach((element) => {
      const value = element.textContent.trim()
      if (value && !element.querySelector('.fa-spinner')) next[element.id] = value
    })
    if (Object.keys(next).length) {
      cached = next
      writeCache(next)
    }
  }

  const showCachedValues = () => {
    elements().forEach((element) => {
      if (cached[element.id]) element.textContent = cached[element.id]
    })
  }

  const initialize = () => {
    showCachedValues()
    window.setTimeout(() => {
      elements().forEach((element) => {
        if (element.querySelector('.fa-spinner')) {
          element.textContent = cached[element.id] || element.dataset.vercountFallback || '--'
          element.title = 'Vercount 暂未返回数据，将在可用时自动更新'
        }
      })
    }, 4500)
  }
  initialize()
  const observer = new MutationObserver(refresh)
  observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true })

  document.addEventListener('pjax:complete', initialize)
})()
