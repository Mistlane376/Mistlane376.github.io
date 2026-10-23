import { onMount } from '../lib/lifecycle'
import { readLocal, writeLocal } from '../lib/storage'

const API_URL = 'https://v2.xxapi.cn/api/ip'
const CACHE_KEY = 'mistlane-visitor-location'
const CACHE_DURATION = 6 * 60 * 60 * 1000
let requestPromise

const createCard = () => {
  const card = document.createElement('section')
  card.className = 'card-widget card-visitor-welcome'
  card.setAttribute('aria-labelledby', 'visitor-welcome-title')
  card.innerHTML =
    '<div class="item-headline">' +
      '<i class="fas fa-location-dot" aria-hidden="true"></i>' +
      '<span id="visitor-welcome-title">访客问候</span>' +
    '</div>' +
    '<p class="visitor-welcome-copy" aria-live="polite">' +
      '<span class="visitor-welcome-loading">正在辨认你从何处来&hellip;</span>' +
    '</p>' +
    '<div class="visitor-welcome-signature" aria-hidden="true">' +
      '<span></span>山海有路，文字相逢<span></span>' +
    '</div>'
  return card
}

const updateCard = (card, address) => {
  if (!card || !card.isConnected) return

  const copy = card.querySelector('.visitor-welcome-copy')
  copy.textContent = ''

  if (address) {
    copy.appendChild(document.createTextNode('欢迎来自'))
    const location = document.createElement('strong')
    location.className = 'visitor-location'
    location.textContent = address
    copy.appendChild(location)
    copy.appendChild(document.createTextNode('的朋友，欢迎来访。这里是我记录思考、分享见闻的自留地，愿你有所得。'))
    card.classList.add('is-ready')
    return
  }

  copy.textContent = '欢迎远道而来的朋友。这里是我记录思考、分享见闻的自留地，愿你有所得。'
  card.classList.add('is-fallback')
}

const readCache = () => {
  const cached = readLocal(CACHE_KEY)
  if (cached && typeof cached.address === 'string' && cached.expires > Date.now()) {
    return cached.address
  }
  return ''
}

const loadAddress = () => {
  const cachedAddress = readCache()
  if (cachedAddress) return Promise.resolve(cachedAddress)
  if (requestPromise) return requestPromise

  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timeout = controller ? setTimeout(() => { controller.abort() }, 5000) : null

  requestPromise = fetch(API_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: controller ? controller.signal : undefined
  })
    .then(response => {
      if (!response.ok) throw new Error('IP API request failed')
      return response.json()
    })
    .then(result => {
      let address = result && result.code === 200 && result.data && result.data.address
      if (typeof address !== 'string' || !address.trim()) throw new Error('IP API returned no address')
      address = address.trim()
      writeLocal(CACHE_KEY, { address, expires: Date.now() + CACHE_DURATION })
      return address
    })
    .catch(() => '')
    .finally(() => {
      if (timeout) clearTimeout(timeout)
    })

  return requestPromise
}

const mountCard = () => {
  const aside = document.getElementById('aside-content')
  if (!aside || aside.querySelector('.card-visitor-welcome')) return

  const card = createCard()
  const rightRail = aside.querySelector('.aside-column-right .sticky_layout')
  const quickLinks = rightRail && rightRail.querySelector('.card-quick-links')
  const announcement = aside.querySelector('.card-announcement')
  const author = aside.querySelector('.card-info')

  if (announcement && rightRail && rightRail.contains(announcement)) {
    announcement.insertAdjacentElement('afterend', card)
  } else if (quickLinks) {
    quickLinks.insertAdjacentElement('beforebegin', card)
  } else if (rightRail) {
    rightRail.appendChild(card)
  } else if (author) {
    author.insertAdjacentElement('afterend', card)
  } else {
    aside.insertAdjacentElement('afterbegin', card)
  }

  loadAddress().then(address => updateCard(card, address))
}

onMount(mountCard)
