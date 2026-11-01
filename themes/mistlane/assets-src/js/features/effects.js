import { onMount } from '../lib/lifecycle'
import { readLocal, writeLocal } from '../lib/storage'

const storageKey = 'mistlane-effects-enabled-v2'
const effectsSelector = '.petal-layer, .day-rain-layer, .night-star-layer'
const compactQuery = window.matchMedia('(max-width: 768px)')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

let effectsEnabled = readLocal(storageKey, true) !== false
let renderFrame = 0

const removeEffects = () => document.querySelectorAll(effectsSelector).forEach(layer => layer.remove())

const createLayer = className => {
  const layer = document.createElement('div')
  layer.className = className
  layer.setAttribute('aria-hidden', 'true')
  return layer
}

const reducedMotion = () => reducedMotionQuery.matches || document.documentElement.dataset.reduceMotion === 'true'

const renderEffects = () => {
  renderFrame = 0
  removeEffects()
  if (!effectsEnabled || reducedMotion()) return

  const compact = compactQuery.matches
  const fragment = document.createDocumentFragment()
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    const petals = createLayer('petal-layer')
    const palettes = ['petal-sky', 'petal-sky', 'petal-sun', 'petal-sun', 'petal-rose']
    for (let index = 0; index < (compact ? 18 : 34); index += 1) {
      const petal = document.createElement('span')
      const size = 14 + Math.random() * 14
      const opacity = 0.6 + Math.random() * 0.3
      const drift = -24 + Math.random() * 48
      const sway = -7 + Math.random() * 14
      petal.className = `petal ${palettes[index % palettes.length]}`
      petal.style.setProperty('--petal-left', `${Math.random() * 100}vw`)
      petal.style.setProperty('--petal-size', `${size}px`)
      petal.style.setProperty('--petal-opacity', `${opacity}`)
      petal.style.setProperty('--petal-night-opacity', `${opacity}`)
      petal.style.setProperty('--petal-duration', `${6.5 + Math.random() * 5.5}s`)
      petal.style.setProperty('--petal-delay', `${-Math.random() * 20}s`)
      petal.style.setProperty('--petal-drift', `${drift}vw`)
      petal.style.setProperty('--petal-night-drift', `${drift * 0.65}vw`)
      petal.style.setProperty('--petal-sway', `${sway}vw`)
      petal.style.setProperty('--petal-spin', `${2.8 + Math.random() * 3.8}s`)
      petals.appendChild(petal)
    }

    const stars = createLayer('night-star-layer')
    for (let index = 0; index < (compact ? 18 : 30); index += 1) {
      const star = document.createElement('span')
      star.className = 'night-star'
      star.style.setProperty('--effect-left', `${Math.random() * 100}vw`)
      star.style.setProperty('--effect-top', `${Math.random() * 92}vh`)
      star.style.setProperty('--effect-size', `${8 + Math.random() * 10}px`)
      star.style.setProperty('--effect-opacity', `${0.7 + Math.random() * 0.28}`)
      star.style.setProperty('--effect-delay', `${-Math.random() * 9}s`)
      star.style.setProperty('--effect-duration', `${2 + Math.random() * 2.4}s`)
      stars.appendChild(star)
    }
    for (let index = 0; index < (compact ? 2 : 3); index += 1) {
      const shootingStar = document.createElement('span')
      shootingStar.className = 'shooting-star'
      shootingStar.style.setProperty('--shooting-left', `${12 + Math.random() * 72}vw`)
      shootingStar.style.setProperty('--shooting-top', `${5 + Math.random() * 45}vh`)
      shootingStar.style.setProperty('--shooting-delay', `${-index * 3.4}s`)
      shootingStar.style.setProperty('--shooting-duration', `${8 + index * 2.1}s`)
      stars.appendChild(shootingStar)
    }
    fragment.append(petals, stars)
  } else {
    const rain = createLayer('day-rain-layer')
    for (let index = 0; index < (compact ? 22 : 42); index += 1) {
      const impact = document.createElement('span')
      impact.className = 'rain-impact'
      impact.style.setProperty('--impact-left', `${4 + Math.random() * 92}vw`)
      impact.style.setProperty('--impact-top', `${8 + Math.random() * 84}vh`)
      impact.style.setProperty('--impact-size', `${compact ? 36 + Math.random() * 46 : 46 + Math.random() * 66}px`)
      impact.style.setProperty('--impact-delay', `${-Math.random() * 7}s`)
      impact.style.setProperty('--impact-duration', `${2.6 + Math.random() * 1.8}s`)
      impact.style.setProperty('--rain-angle', `${7 + Math.random() * 8}deg`)
      impact.style.setProperty('--rain-length', `${compact ? 24 + Math.random() * 14 : 30 + Math.random() * 20}px`)
      impact.style.setProperty('--rain-width', `${1.3 + Math.random() * 0.8}px`)
      impact.style.setProperty('--rain-opacity', `${0.65 + Math.random() * 0.25}`)
      const drop = document.createElement('span')
      drop.className = 'rain-drop'
      const ripple = document.createElement('span')
      ripple.className = 'water-ripple'
      impact.append(drop, ripple)
      rain.appendChild(impact)
    }
    fragment.appendChild(rain)
  }

  document.body.appendChild(fragment)
  syncPaused()
}

const syncPaused = () => {
  document.documentElement.classList.toggle('effects-paused', document.hidden)
}

const scheduleRender = () => {
  if (renderFrame) return
  renderFrame = window.requestAnimationFrame(renderEffects)
}

const syncToggle = () => {
  const toggle = document.getElementById('toggle-effects')
  if (!toggle) return
  toggle.title = effectsEnabled ? '关闭动态特效' : '开启动态特效'
  toggle.setAttribute('aria-label', toggle.title)
  toggle.innerHTML = `<i class="fas ${effectsEnabled ? 'fa-wind' : 'fa-pause'}"></i>`
}

const applyEffectsState = enabled => {
  effectsEnabled = enabled
  document.documentElement.classList.toggle('effects-disabled', !enabled)
  writeLocal(storageKey, enabled)
  syncToggle()
  renderEffects()
}

// The ambient motion toggle lives in the rightside hide panel, which PJAX
// swaps on navigation, so it is re-created on every mount when missing.
const ensureToggle = () => {
  const panel = document.getElementById('rightside-config-hide')
  if (!panel) return
  if (!document.getElementById('toggle-effects')) {
    const toggle = document.createElement('button')
    toggle.id = 'toggle-effects'
    toggle.type = 'button'
    toggle.addEventListener('click', () => applyEffectsState(!effectsEnabled))
    panel.appendChild(toggle)
  }
  syncToggle()
}

const listen = (query, handler) => {
  if (typeof query.addEventListener === 'function') query.addEventListener('change', handler)
  else query.addListener(handler)
}

new MutationObserver(records => {
  if (records.some(record => record.oldValue !== document.documentElement.getAttribute(record.attributeName))) scheduleRender()
}).observe(document.documentElement, { attributes: true, attributeOldValue: true, attributeFilter: ['data-theme', 'data-reduce-motion'] })

listen(compactQuery, scheduleRender)
listen(reducedMotionQuery, scheduleRender)
document.addEventListener('visibilitychange', syncPaused)

onMount(() => {
  syncPaused()
  document.documentElement.classList.toggle('effects-disabled', !effectsEnabled)
  ensureToggle()
  if (!document.querySelector(effectsSelector)) renderEffects()
})
