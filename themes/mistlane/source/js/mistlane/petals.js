(() => {
  'use strict';

  const storageKey = 'mistlane-effects-enabled-v2';
  const effectsSelector = '.petal-layer, .day-rain-layer, .night-star-layer';
  const compactView = window.matchMedia('(max-width: 768px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let effectsEnabled = true;

  try {
    effectsEnabled = localStorage.getItem(storageKey) !== 'false';
  } catch {
    effectsEnabled = true;
  }

  const removeEffects = () => document.querySelectorAll(effectsSelector).forEach((layer) => layer.remove());

  const createLayer = (className) => {
    const layer = document.createElement('div');
    layer.className = className;
    layer.setAttribute('aria-hidden', 'true');
    return layer;
  };

  const renderEffects = () => {
    removeEffects();
    if (!effectsEnabled || reducedMotion) return;

    const fragment = document.createDocumentFragment();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      const petals = createLayer('petal-layer');
      const palettes = ['petal-sky', 'petal-sky', 'petal-sun', 'petal-sun', 'petal-rose'];
      const petalCount = compactView ? 12 : 22;
      for (let index = 0; index < petalCount; index += 1) {
        const petal = document.createElement('span');
        const size = 10 + Math.random() * 13;
        const opacity = 0.48 + Math.random() * 0.28;
        const drift = -16 + Math.random() * 32;
        petal.className = `petal ${palettes[index % palettes.length]}`;
        petal.style.setProperty('--petal-left', `${Math.random() * 100}vw`);
        petal.style.setProperty('--petal-size', `${size}px`);
        petal.style.setProperty('--petal-opacity', `${opacity}`);
        petal.style.setProperty('--petal-night-opacity', `${opacity * 0.82}`);
        petal.style.setProperty('--petal-duration', `${8 + Math.random() * 9}s`);
        petal.style.setProperty('--petal-delay', `${-Math.random() * 16}s`);
        petal.style.setProperty('--petal-drift', `${drift}vw`);
        petal.style.setProperty('--petal-night-drift', `${drift * -0.35}vw`);
        petal.style.setProperty('--petal-spin', `${2.8 + Math.random() * 3.2}s`);
        petals.appendChild(petal);
      }

      const stars = createLayer('night-star-layer');
      for (let index = 0; index < (compactView ? 11 : 20); index += 1) {
        const star = document.createElement('span');
        star.className = 'night-star';
        star.style.setProperty('--effect-left', `${Math.random() * 100}vw`);
        star.style.setProperty('--effect-top', `${Math.random() * 92}vh`);
        star.style.setProperty('--effect-size', `${5 + Math.random() * 8}px`);
        star.style.setProperty('--effect-delay', `${-Math.random() * 8}s`);
        star.style.setProperty('--effect-duration', `${2.5 + Math.random() * 4.5}s`);
        stars.appendChild(star);
      }
      fragment.append(petals, stars);
    } else {
      const rain = createLayer('day-rain-layer');
      for (let index = 0; index < (compactView ? 12 : 26); index += 1) {
        const impact = document.createElement('span');
        impact.className = 'rain-impact';
        impact.style.setProperty('--impact-left', `${4 + Math.random() * 92}vw`);
        impact.style.setProperty('--impact-top', `${8 + Math.random() * 84}vh`);
        impact.style.setProperty('--impact-size', `${42 + Math.random() * 88}px`);
        impact.style.setProperty('--impact-delay', `${-Math.random() * 5.5}s`);
        impact.style.setProperty('--impact-duration', `${3.2 + Math.random() * 3.8}s`);
        const drop = document.createElement('span');
        drop.className = 'rain-drop';
        const ripple = document.createElement('span');
        ripple.className = 'water-ripple';
        impact.append(drop, ripple);
        rain.appendChild(impact);
      }
      fragment.appendChild(rain);
    }

    document.body.appendChild(fragment);
  };

  const applyEffectsState = (enabled) => {
    effectsEnabled = enabled;
    document.documentElement.classList.toggle('effects-disabled', !enabled);
    try {
      localStorage.setItem(storageKey, String(enabled));
    } catch {
      // The visual setting still works for the current page when storage is unavailable.
    }
    const toggle = document.getElementById('toggle-effects');
    if (toggle) {
      toggle.title = enabled ? '关闭动态特效' : '开启动态特效';
      toggle.setAttribute('aria-label', toggle.title);
      toggle.innerHTML = `<i class="fas ${enabled ? 'fa-wind' : 'fa-pause'}"></i>`;
    }
    renderEffects();
  };

  const settingsPanel = document.getElementById('rightside-config-hide');
  const settingsButton = document.getElementById('rightside-config');
  if (settingsButton) {
    settingsButton.title = '显示设置';
    settingsButton.setAttribute('aria-label', '显示设置');
    settingsButton.innerHTML = '<i class="fas fa-sliders-h" aria-hidden="true"></i>';
  }

  const themeToggle = document.getElementById('darkmode');
  if (themeToggle) {
    themeToggle.title = '切换明暗外观';
    themeToggle.setAttribute('aria-label', themeToggle.title);
  }

  if (settingsPanel && !document.getElementById('toggle-effects')) {
    const toggle = document.createElement('button');
    toggle.id = 'toggle-effects';
    toggle.type = 'button';
    toggle.addEventListener('click', () => applyEffectsState(!effectsEnabled));
    settingsPanel.appendChild(toggle);
  }

  new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'data-theme')) renderEffects();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  applyEffectsState(effectsEnabled);
})();
