(() => {
  'use strict';

  let disposeAlbum = null;

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  };

  const createIcon = className => {
    const icon = createElement('i', className);
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  };

  const safeText = value => typeof value === 'string' ? value.trim() : '';

  const decodeBase64 = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));

  const decryptPrivateAlbum = async (envelope, password) => {
    if (!window.crypto?.subtle || envelope?.version !== 1) throw new Error('当前浏览器不支持安全解密');
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt: decodeBase64(envelope.salt),
      iterations: Number(envelope.iterations),
      hash: 'SHA-256'
    }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv: decodeBase64(envelope.iv),
      tagLength: 128
    }, key, decodeBase64(envelope.data));
    return JSON.parse(new TextDecoder().decode(plaintext));
  };

  const normalizeDate = value => {
    const date = safeText(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
  };

  const formatDate = value => {
    const normalized = normalizeDate(value);
    if (!normalized) return '日期未记录';

    const date = new Date(`${normalized}T12:00:00`);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const normalizeAlbums = payload => {
    if (!payload || !Array.isArray(payload.albums)) return [];

    return payload.albums.map((rawAlbum, albumIndex) => {
      const fallbackId = `album-${albumIndex + 1}`;
      const albumDate = normalizeDate(rawAlbum && rawAlbum.date);
      const photos = Array.isArray(rawAlbum && rawAlbum.photos)
        ? rawAlbum.photos.map((rawPhoto, photoIndex) => ({
          src: safeText(rawPhoto && rawPhoto.src),
          thumb: safeText(rawPhoto && rawPhoto.thumb),
          alt: safeText(rawPhoto && rawPhoto.alt) || `相册照片 ${photoIndex + 1}`,
          caption: safeText(rawPhoto && rawPhoto.caption),
          date: normalizeDate(rawPhoto && rawPhoto.date) || albumDate
        })).filter(photo => photo.src)
        : [];

      return {
        id: safeText(rawAlbum && rawAlbum.id) || fallbackId,
        name: safeText(rawAlbum && rawAlbum.name) || `相册 ${albumIndex + 1}`,
        date: albumDate || (photos[0] && photos[0].date) || '',
        location: safeText(rawAlbum && rawAlbum.location),
        description: safeText(rawAlbum && rawAlbum.description),
        photos
      };
    }).filter(album => album.photos.length > 0)
      .sort((left, right) => right.date.localeCompare(left.date));
  };

  const makeImage = (photo, lazy = true) => {
    const image = createElement('img');
    image.src = photo.thumb || photo.src;
    image.alt = photo.alt;
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    if (lazy) image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.src = '/img/404.jpg';
    }, { once: true });
    return image;
  };

  const initializeAlbum = () => {
    if (disposeAlbum) {
      disposeAlbum();
      disposeAlbum = null;
    }

    const root = document.getElementById('photo-album');
    if (!root) return;

    const controller = new AbortController();
    const { signal } = controller;
    const source = root.dataset.source || '/album/data.json';
    const loading = root.querySelector('#album-loading');
    const empty = root.querySelector('#album-empty');
    const groupsPanel = root.querySelector('#album-groups');
    const datesPanel = root.querySelector('#album-dates');
    const result = root.querySelector('#album-result');
    const viewButtons = Array.from(root.querySelectorAll('[data-view]'));
    const dialog = root.querySelector('#album-lightbox');
    const lightboxImage = root.querySelector('#lightbox-image');
    const lightboxCaption = root.querySelector('#lightbox-caption');
    const lightboxPosition = root.querySelector('#lightbox-position');
    const lightboxTitle = root.querySelector('#lightbox-title');
    const lightboxGroup = root.querySelector('#lightbox-group');
    const lightboxThumbs = root.querySelector('#lightbox-thumbs');
    const previousButton = root.querySelector('[data-lightbox-prev]');
    const nextButton = root.querySelector('[data-lightbox-next]');
    const closeButton = root.querySelector('[data-lightbox-close]');
    const stage = root.querySelector('.album-lightbox-stage');
    const privateDialog = root.querySelector('#private-album-dialog');
    const privateForm = root.querySelector('#private-album-form');
    const privatePassword = root.querySelector('#private-album-password');
    const privateError = root.querySelector('#private-album-error');
    const privateTitle = root.querySelector('#private-album-title');
    const privateDescription = root.querySelector('#private-album-description');
    let albums = [];
    let privateAlbums = [];
    let selectedPrivateAlbum = null;
    let activeView = 'groups';
    let activeAlbum = null;
    let activePhotoIndex = 0;
    let lightboxOpener = null;
    let swipeStartX = null;

    const allPhotos = () => albums.flatMap(album => album.photos.map((photo, photoIndex) => ({
      ...photo,
      album,
      photoIndex
    })));

    const updateSummary = () => {
      const photos = allPhotos();
      const dates = new Set(photos.map(photo => photo.date).filter(Boolean));
      root.querySelector('#album-count').textContent = String(albums.length);
      root.querySelector('#photo-count').textContent = String(photos.length);
      root.querySelector('#date-count').textContent = String(dates.size);
      result.textContent = activeView === 'groups'
        ? `${albums.length} 组相册 · ${photos.length} 张照片`
        : `${dates.size} 个日期块 · ${photos.length} 张照片`;
    };

    const activateView = view => {
      activeView = view === 'dates' ? 'dates' : 'groups';
      groupsPanel.hidden = activeView !== 'groups';
      datesPanel.hidden = activeView !== 'dates';

      viewButtons.forEach(button => {
        const isActive = button.dataset.view === activeView;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      updateSummary();
    };

    const showPhoto = index => {
      if (!activeAlbum || activeAlbum.photos.length === 0) return;

      const photoCount = activeAlbum.photos.length;
      activePhotoIndex = (index + photoCount) % photoCount;
      const photo = activeAlbum.photos[activePhotoIndex];
      lightboxImage.src = photo.src;
      lightboxImage.alt = photo.alt;
      lightboxTitle.textContent = photo.caption || photo.alt;
      lightboxCaption.textContent = formatDate(photo.date);
      lightboxPosition.textContent = `${activePhotoIndex + 1} / ${photoCount}`;
      previousButton.disabled = photoCount < 2;
      nextButton.disabled = photoCount < 2;

      Array.from(lightboxThumbs.children).forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === activePhotoIndex;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
        if (isActive) thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    };

    const buildLightboxThumbs = () => {
      lightboxThumbs.replaceChildren();
      if (!activeAlbum) return;

      activeAlbum.photos.forEach((photo, index) => {
        const button = createElement('button', 'album-thumb-button');
        button.type = 'button';
        button.title = photo.caption || photo.alt;
        button.setAttribute('aria-label', `查看第 ${index + 1} 张照片`);
        button.append(makeImage(photo));
        button.addEventListener('click', () => showPhoto(index), { signal });
        lightboxThumbs.append(button);
      });
    };

    const openLightbox = (album, index, opener) => {
      activeAlbum = album;
      lightboxOpener = opener || document.activeElement;
      lightboxGroup.textContent = `${album.name} · ${album.photos.length} 张`;
      buildLightboxThumbs();
      showPhoto(index);
      document.body.classList.add('album-modal-open');

      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    };

    const closeLightbox = () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('album-modal-open');
    };

    const renderGroups = () => {
      const grid = createElement('div', 'album-group-grid');

      privateAlbums.forEach(metadata => {
        const card = createElement('article', 'album-group-card private-album-card');
        const lock = createElement('button', 'private-album-lock');
        lock.type = 'button';
        lock.setAttribute('aria-label', `解锁私密相册：${metadata.name}`);
        lock.append(createIcon('fas fa-lock'));
        lock.append(createElement('span', '', '输入密码解锁'));
        lock.addEventListener('click', () => {
          selectedPrivateAlbum = metadata;
          privateTitle.textContent = `解锁「${metadata.name}」`;
          privateDescription.textContent = `此相册包含 ${metadata.photoCount || 0} 张加密照片，密码只在本地使用。`;
          privateError.textContent = '';
          privatePassword.value = '';
          if (typeof privateDialog.showModal === 'function') privateDialog.showModal();
          else privateDialog.setAttribute('open', '');
          requestAnimationFrame(() => privatePassword.focus());
        }, { signal });
        const copy = createElement('div', 'album-group-copy');
        const kicker = createElement('div', 'album-group-kicker');
        kicker.append(createIcon('fas fa-shield-halved'), document.createTextNode(' 私密相册'));
        copy.append(kicker, createElement('h2', '', metadata.name), createElement('p', 'album-group-description', '内容已加密，解锁后仅在当前页面显示。'));
        card.append(lock, copy);
        grid.append(card);
      });

      albums.forEach(album => {
        const card = createElement('article', 'album-group-card');
        const stack = createElement('button', 'album-stack');
        stack.type = 'button';
        stack.setAttribute('aria-label', `预览相册：${album.name}，共 ${album.photos.length} 张照片`);

        album.photos.slice(0, 3).forEach(photo => {
          const frame = createElement('span', 'album-stack-frame');
          frame.append(makeImage(photo));
          stack.append(frame);
        });

        const more = createElement('span', 'album-stack-more', `${album.photos.length} 张`);
        stack.append(more);
        stack.addEventListener('click', () => openLightbox(album, 0, stack), { signal });

        const copy = createElement('div', 'album-group-copy');
        const kicker = createElement('div', 'album-group-kicker');
        kicker.append(createIcon('far fa-calendar-alt'));
        kicker.append(createElement('time', '', formatDate(album.date)));
        const title = createElement('h2', '', album.name);
        const description = createElement('p', 'album-group-description', album.description || '一组值得回看的片刻。');
        const meta = createElement('div', 'album-group-meta');
        const photoMeta = createElement('span');
        photoMeta.append(createIcon('far fa-images'));
        photoMeta.append(document.createTextNode(`${album.photos.length} 张照片`));
        meta.append(photoMeta);

        if (album.location) {
          const locationMeta = createElement('span');
          locationMeta.append(createIcon('fas fa-map-marker-alt'));
          locationMeta.append(document.createTextNode(album.location));
          meta.append(locationMeta);
        }

        copy.append(kicker, title, description, meta);
        card.append(stack, copy);
        grid.append(card);
      });

      groupsPanel.replaceChildren(grid);
    };

    const renderDates = () => {
      const dateGroups = new Map();
      allPhotos().sort((left, right) => right.date.localeCompare(left.date)).forEach(photo => {
        const key = photo.date || 'undated';
        if (!dateGroups.has(key)) dateGroups.set(key, []);
        dateGroups.get(key).push(photo);
      });

      const list = createElement('div', 'album-date-list');
      dateGroups.forEach((photos, date) => {
        const section = createElement('section', 'album-date-section');
        const header = createElement('header', 'album-date-header');
        const time = createElement('time', '', formatDate(date));
        if (date !== 'undated') time.dateTime = date;
        header.append(time, createElement('span', 'album-date-count', `${photos.length} 张`));

        const grid = createElement('div', 'album-date-grid');
        photos.forEach(photo => {
          const button = createElement('button', 'album-photo-tile');
          button.type = 'button';
          button.setAttribute('aria-label', `预览：${photo.caption || photo.alt}`);
          button.append(makeImage(photo));
          button.append(createElement('span', 'album-photo-label', photo.caption || photo.album.name));
          button.addEventListener('click', () => openLightbox(photo.album, photo.photoIndex, button), { signal });
          grid.append(button);
        });

        section.append(header, grid);
        list.append(section);
      });

      datesPanel.replaceChildren(list);
    };

    const showEmptyState = (title, message) => {
      empty.querySelector('h2').textContent = title;
      empty.querySelector('p').textContent = message;
      empty.hidden = false;
      groupsPanel.hidden = true;
      datesPanel.hidden = true;
    };

    viewButtons.forEach(button => {
      button.addEventListener('click', () => activateView(button.dataset.view), { signal });
    });

    previousButton.addEventListener('click', () => showPhoto(activePhotoIndex - 1), { signal });
    nextButton.addEventListener('click', () => showPhoto(activePhotoIndex + 1), { signal });
    closeButton.addEventListener('click', closeLightbox, { signal });

    root.querySelector('[data-private-close]')?.addEventListener('click', () => privateDialog.close(), { signal });
    root.querySelector('[data-private-password-toggle]')?.addEventListener('click', event => {
      const button = event.currentTarget;
      const show = privatePassword.type === 'password';
      privatePassword.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
      button.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
    }, { signal });
    privateForm?.addEventListener('submit', async event => {
      event.preventDefault();
      if (!selectedPrivateAlbum || !privatePassword.value) return;
      const submit = privateForm.querySelector('.private-album-submit');
      submit.disabled = true;
      privateError.textContent = '正在本地解密...';
      try {
        const response = await fetch(selectedPrivateAlbum.envelope, { cache: 'no-store' });
        if (!response.ok) throw new Error(`加密相册读取失败 (${response.status})`);
        const decrypted = await decryptPrivateAlbum(await response.json(), privatePassword.value);
        const [album] = normalizeAlbums({ albums: [decrypted] });
        if (!album) throw new Error('相册内容无效');
        albums.unshift(album);
        privateAlbums = privateAlbums.filter(item => item.id !== selectedPrivateAlbum.id);
        privateDialog.close();
        renderGroups();
        renderDates();
        activateView('groups');
      } catch (error) {
        console.error('[private-album]', error);
        privateError.textContent = error.name === 'OperationError' ? '密码不正确，请重新输入。' : error.message;
        privatePassword.select();
      } finally {
        submit.disabled = false;
      }
    }, { signal });

    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeLightbox();
    }, { signal });

    dialog.addEventListener('close', () => {
      document.body.classList.remove('album-modal-open');
      if (lightboxOpener && document.contains(lightboxOpener)) lightboxOpener.focus();
    }, { signal });

    dialog.addEventListener('cancel', () => {
      document.body.classList.remove('album-modal-open');
    }, { signal });

    document.addEventListener('keydown', event => {
      if (!dialog.open) return;
      if (event.key === 'ArrowLeft') showPhoto(activePhotoIndex - 1);
      if (event.key === 'ArrowRight') showPhoto(activePhotoIndex + 1);
    }, { signal });

    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') swipeStartX = event.clientX;
    }, { signal });

    stage.addEventListener('pointerup', event => {
      if (swipeStartX === null || event.pointerType !== 'touch') return;
      const distance = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(distance) < 48) return;
      showPhoto(activePhotoIndex + (distance < 0 ? 1 : -1));
    }, { signal });

    fetch(source, { headers: { Accept: 'application/json' } })
      .then(response => {
        if (!response.ok) throw new Error(`Album request failed: ${response.status}`);
        return response.json();
      })
      .then(payload => {
        albums = normalizeAlbums(payload);
        privateAlbums = Array.isArray(payload.privateAlbums)
          ? payload.privateAlbums.filter(item => item && item.envelope && item.name)
          : [];
        loading.hidden = true;

        if (albums.length === 0 && privateAlbums.length === 0) {
          result.textContent = '0 组相册 · 0 张照片';
          showEmptyState('还没有照片', '新的影像记录会出现在这里。');
          return;
        }

        renderGroups();
        renderDates();
        activateView('groups');
      })
      .catch(error => {
        console.error('[album]', error);
        loading.hidden = true;
        result.textContent = '相册读取失败';
        showEmptyState('相册暂时无法读取', '照片数据没有成功载入，请稍后再试。');
      });

    disposeAlbum = () => {
      controller.abort();
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      document.body.classList.remove('album-modal-open');
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAlbum, { once: true });
  } else {
    initializeAlbum();
  }

  document.addEventListener('pjax:complete', initializeAlbum);
})();
