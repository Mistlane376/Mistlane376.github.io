(function () {
  'use strict';

  var API_URL = 'https://v2.xxapi.cn/api/ip';
  var CACHE_KEY = 'mistlane-visitor-location';
  var CACHE_DURATION = 6 * 60 * 60 * 1000;
  var requestPromise;

  function createCard() {
    var card = document.createElement('section');
    card.className = 'card-widget card-visitor-welcome';
    card.setAttribute('aria-labelledby', 'visitor-welcome-title');
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
      '</div>';
    return card;
  }

  function mountCard() {
    var aside = document.getElementById('aside-content');
    if (!aside || aside.querySelector('.card-visitor-welcome')) return;

    var card = createCard();
    var announcement = aside.querySelector('.card-announcement');
    var author = aside.querySelector('.card-info');

    if (announcement) {
      announcement.insertAdjacentElement('afterend', card);
    } else if (author) {
      author.insertAdjacentElement('afterend', card);
    } else {
      aside.insertAdjacentElement('afterbegin', card);
    }

    loadAddress().then(function (address) {
      updateCard(card, address);
    });
  }

  function updateCard(card, address) {
    if (!card || !card.isConnected) return;

    var copy = card.querySelector('.visitor-welcome-copy');
    copy.textContent = '';

    if (address) {
      copy.appendChild(document.createTextNode('欢迎来自'));
      var location = document.createElement('strong');
      location.className = 'visitor-location';
      location.textContent = address;
      copy.appendChild(location);
      copy.appendChild(document.createTextNode('的朋友，欢迎来访。这里是我记录思考、分享见闻的自留地，愿你有所得。'));
      card.classList.add('is-ready');
      return;
    }

    copy.textContent = '欢迎远道而来的朋友。这里是我记录思考、分享见闻的自留地，愿你有所得。';
    card.classList.add('is-fallback');
  }

  function readCache() {
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && typeof cached.address === 'string' && cached.expires > Date.now()) {
        return cached.address;
      }
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      return '';
    }
    return '';
  }

  function writeCache(address) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        address: address,
        expires: Date.now() + CACHE_DURATION
      }));
    } catch (error) {
      // The greeting still works when storage is unavailable.
    }
  }

  function loadAddress() {
    var cachedAddress = readCache();
    if (cachedAddress) return Promise.resolve(cachedAddress);
    if (requestPromise) return requestPromise;

    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 5000) : null;

    requestPromise = fetch(API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error('IP API request failed');
        return response.json();
      })
      .then(function (result) {
        var address = result && result.code === 200 && result.data && result.data.address;
        if (typeof address !== 'string' || !address.trim()) throw new Error('IP API returned no address');
        address = address.trim();
        writeCache(address);
        return address;
      })
      .catch(function () {
        return '';
      })
      .finally(function () {
        if (timeout) clearTimeout(timeout);
      });

    return requestPromise;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCard, { once: true });
  } else {
    mountCard();
  }

  document.addEventListener('pjax:complete', mountCard);
}());
