(() => {
  'use strict'
  if (window.MistlaneAppearance) return

  const key = 'mistlane-appearance-v2'
  const defaults = { font: 'system', colorMode: 'auto', fontSize: 100, reduceMotion: false }
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}')
      delete saved.glass
      return { ...defaults, ...saved }
    } catch (_) { return { ...defaults } }
  }
  let state = read()

  const setDark = mode => {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches
    const dark = mode === 'dark' || (mode === 'auto' && prefersDark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
  const apply = () => {
    document.documentElement.dataset.siteFont = state.font
    document.documentElement.dataset.reduceMotion = String(state.reduceMotion)
    document.documentElement.style.fontSize = `${state.fontSize}%`
    setDark(state.colorMode)
  }
  const save = () => { localStorage.setItem(key, JSON.stringify(state)); apply(); sync() }
  const sync = () => {
    document.querySelectorAll('[data-font]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.font === state.font)))
    document.querySelectorAll('[data-color-mode]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.colorMode === state.colorMode)))
    const fontSize = document.getElementById('mistlane-font-size-range')
    const output = document.getElementById('mistlane-font-size-output')
    const motion = document.getElementById('mistlane-motion-toggle')
    const summary = document.getElementById('mistlane-appearance-summary')
    if (fontSize) fontSize.value = String(state.fontSize)
    if (output) output.value = `${state.fontSize}%`
    if (motion) motion.checked = state.reduceMotion
    if (summary) {
      const fontNames = { system: '默认字体', geely: '几何设计体', xiangcui: '香萃集雪松' }
      const modeNames = { auto: '自动模式', light: '浅色模式', dark: '深色模式' }
      summary.textContent = `${fontNames[state.font] || fontNames.system} · ${modeNames[state.colorMode] || modeNames.auto} · ${state.fontSize}%`
    }
  }
  const setOpen = open => {
    const panel = document.getElementById('mistlane-settings-panel')
    const toggle = document.getElementById('mistlane-settings-toggle')
    if (!panel || !toggle) return
    panel.classList.toggle('is-open', open)
    document.documentElement.classList.toggle('mistlane-settings-open', open)
    panel.setAttribute('aria-hidden', String(!open))
    toggle.setAttribute('aria-expanded', String(open))
    if (open) panel.querySelector('[data-close-settings]')?.focus({ preventScroll: true })
    else if (document.activeElement && panel.contains(document.activeElement)) toggle.focus({ preventScroll: true })
  }
  const bind = () => {
    if (document.documentElement.dataset.appearanceBound === 'true') { sync(); return }
    document.documentElement.dataset.appearanceBound = 'true'
    document.addEventListener('click', event => {
      if (event.target.closest('#mistlane-settings-toggle')) setOpen(!document.getElementById('mistlane-settings-panel').classList.contains('is-open'))
      if (event.target.closest('[data-close-settings]')) setOpen(false)
    })
    document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => { state.font = button.dataset.font; save() }))
    document.querySelectorAll('[data-color-mode]').forEach(button => button.addEventListener('click', () => { state.colorMode = button.dataset.colorMode; save() }))
    document.getElementById('mistlane-font-size-range')?.addEventListener('input', event => { state.fontSize = Number(event.target.value); save() })
    document.getElementById('mistlane-motion-toggle')?.addEventListener('change', event => { state.reduceMotion = event.target.checked; save() })
    document.getElementById('mistlane-settings-reset')?.addEventListener('click', () => { state = { ...defaults }; save() })
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab') return
      const panel = document.getElementById('mistlane-settings-panel')
      if (!panel?.classList.contains('is-open')) return
      const focusable = [...panel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')].filter(item => !item.disabled)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    })
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (state.colorMode === 'auto') setDark('auto') })
    sync()
  }
  apply()
  bind()
  window.MistlaneAppearance = { apply, bind }
})()
