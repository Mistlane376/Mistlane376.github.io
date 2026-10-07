(() => {
  'use strict'

  // 站点访问量：直接调用 Vercount 的公开接口，不依赖其前端脚本能否成功发起请求
  // （实测 https://events.vercount.one/js 会加载成功，但在部分网络下不发送 API 请求，
  // 元素就永远停在 loading 状态）。
  //
  // 策略：先显示本地缓存 → 请求接口 → 成功则写入并缓存；失败则保留缓存值/占位符。
  const ENDPOINT = 'https://events.vercount.one/api/v2/log'
  const CACHE_KEY = 'mistlane-vercount-stats'
  const TIMEOUT = 12000

  // 元素 id → 接口字段
  const FIELDS = {
    vercount_value_site_uv: 'site_uv',
    vercount_value_site_pv: 'site_pv',
    vercount_value_page_pv: 'page_pv'
  }

  const elements = () => Object.keys(FIELDS)
    .map((id) => document.getElementById(id))
    .filter(Boolean)

  const readCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}
    } catch (_) {
      return {}
    }
  }

  const writeCache = (value) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(value))
    } catch (_) {
      // 存储不可用时仍然照常展示本次结果。
    }
  }

  const render = (data) => {
    Object.keys(FIELDS).forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return
      const value = data[FIELDS[id]]
      if (value === undefined || value === null || value === '') return
      element.textContent = String(value)
      element.removeAttribute('title')
    })
  }

  const placeholders = () => {
    Object.keys(FIELDS).forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return
      if (element.textContent.trim()) return
      element.textContent = element.dataset.vercountFallback || '—'
      element.title = '访问统计暂不可用'
    })
  }

  let initialLoadDone = false

  const load = async (countView) => {
    const cached = readCache()
    render(cached)

    // PJAX 切换是同一份文档内的路由替换，再调接口会把 PV 重复累加；
    // 因此只在真正的页面加载时计数，后续切换只沿用缓存值。
    if (!countView) {
      if (!Object.keys(cached).length) placeholders()
      return
    }

    let timer = null
    try {
      const controller = new AbortController()
      timer = window.setTimeout(() => controller.abort(), TIMEOUT)
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.href }),
        signal: controller.signal
      })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      const payload = await response.json()
      if (!payload || payload.status !== 'success' || !payload.data) throw new Error('bad payload')
      const next = Object.assign({}, cached, payload.data)
      render(next)
      writeCache(next)
    } catch (_) {
      // 网络被拦截或超时：保留缓存值，只给仍未填充的元素一个占位符。
      placeholders()
    } finally {
      if (timer) window.clearTimeout(timer)
    }
  }

  load(!initialLoadDone)
  initialLoadDone = true
  document.addEventListener('pjax:complete', () => load(false))
})()
