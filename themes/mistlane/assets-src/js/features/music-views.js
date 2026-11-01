import { onMount } from '../lib/lifecycle'

// The room and the persistent pocket player are views of one audio kernel.
export const bindMusicViews = player => {
  const all = selector => document.querySelectorAll(selector)
  const text = (selector, value) => all(selector).forEach(node => { node.textContent = value })
  const modeLabels = ['顺序播放', '单曲循环', '随机播放']
  const modeIcons = ['fa-list-ol', 'fa-repeat', 'fa-shuffle']
  let returnFocus = null
  let notice = ''
  let scrubber = null
  let lyricFrame = 0
  let lyricResizeObserver = null

  const setNotice = message => {
    notice = message
    text('[data-music-notice]', message)
    all('.music-mini-notice').forEach(node => { node.hidden = !message || message === '收藏喜欢的旋律，让它们陪你度过平常的一天。' })
  }

  const setPanel = (open, restoreFocus = false) => {
    const panel = document.getElementById('mistlane-music-panel')
    const orb = document.getElementById('mistlane-music-orb')
    if (!panel || !orb) return
    if (open) {
      returnFocus = document.activeElement
      setNotice(player.getState().initialized ? notice : '正在整理歌单…')
      player.init()
    }
    panel.classList.toggle('is-open', open)
    panel.setAttribute('aria-hidden', String(!open))
    panel.inert = !open
    orb.setAttribute('aria-expanded', String(open))
    orb.setAttribute('aria-label', open ? '收起音乐播放器' : '打开音乐播放器')
    orb.title = open ? '收起音乐播放器' : '打开音乐播放器'
    orb.closest('.music-float-dock')?.classList.toggle('is-expanded', open)
    if (open) panel.querySelector('[data-close-music]')?.focus({ preventScroll: true })
    else if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
  }
  player.setPanel = setPanel

  const filterPlaylist = () => {
    const query = (document.querySelector('[data-music-search]')?.value || '').trim().toLocaleLowerCase()
    let visible = 0
    all('[data-music-playlist="full"] [data-music-index]').forEach(button => {
      const match = !query || button.dataset.search.includes(query)
      button.hidden = !match
      if (match) visible += 1
    })
    all('[data-music-empty]').forEach(node => { node.hidden = visible > 0 || !player.getState().initialized })
    text('[data-music-count]', query ? `${visible} 首匹配` : `${player.getState().playlist.length} 首`)
  }

  const renderPlaylist = () => {
    const state = player.getState()
    all('[data-music-playlist]').forEach(list => {
      const full = list.dataset.musicPlaylist === 'full'
      list.replaceChildren(...state.playlist.map((track, index) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.dataset.musicIndex = String(index)
        button.dataset.search = `${track.name} ${track.artist}`.toLocaleLowerCase()
        button.setAttribute('aria-label', `播放 ${track.name}，${track.artist}`)
        button.innerHTML = full
          ? '<span class="music-song-number"></span><span class="music-song-info"><strong></strong><small></small></span><span class="music-song-play"><i class="fas fa-play" aria-hidden="true"></i></span>'
          : '<span class="music-song-number"></span><span class="music-mini-song"><strong></strong><small></small></span><span class="music-mini-song-mark" aria-hidden="true"><i></i><i></i><i></i></span>'
        button.querySelector('.music-song-number').textContent = String(index + 1).padStart(2, '0')
        button.querySelector('strong').textContent = track.name
        button.querySelector('small').textContent = track.artist
        return button
      }))
    })
    filterPlaylist()
    text('[data-music-mini-count]', `${state.playlist.length} 首`)
    renderTrack()
  }

  const renderTrack = () => {
    const { track, currentIndex } = player.getState()
    text('[data-music-name]', track?.name || '一首歌的时间')
    text('[data-music-artist]', track?.artist || '选一首喜欢的，慢慢听。')
    // A local illustration also gives tracks without artwork a complete cover.
    const cover = track?.pic || '/images/selection3.jpg'
    all('[data-music-cover]').forEach(node => {
      node.style.backgroundImage = `url(${JSON.stringify(cover)}), url('/images/selection3.jpg')`
      node.classList.add('has-cover')
    })
    all('[data-music-index]').forEach(button => {
      const active = Number(button.dataset.musicIndex) === currentIndex
      button.classList.toggle('is-active', active)
      if (active) button.setAttribute('aria-current', 'true')
      else button.removeAttribute('aria-current')
    })
    if ('mediaSession' in navigator && track && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.name, artist: track.artist, album: 'Mistlane 的私人听音室', artwork: [{ src: new URL(cover, location.href).href }] })
    }
    renderPlayState()
  }

  const renderPlayState = () => {
    const { isPlaying, initialized } = player.getState()
    all('[data-music-play]').forEach(button => {
      button.setAttribute('aria-label', isPlaying ? '暂停' : '播放')
      button.title = isPlaying ? '暂停' : '播放'
      button.querySelector('i').className = `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`
    })
    all('#music-room, .music-float-dock, #mistlane-music-panel').forEach(node => node.classList.toggle('is-playing', isPlaying))
    all('[data-music-index]').forEach(button => {
      const icon = button.querySelector('.music-song-play i')
      if (icon) icon.className = `fas ${isPlaying && button.classList.contains('is-active') ? 'fa-pause' : 'fa-play'}`
    })
    text('[data-music-status]', isPlaying ? '正在播放' : initialized ? '暂停片刻，也很好' : '等你按下播放')
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }

  const renderTime = (value = player.getState()) => {
    text('[data-music-elapsed]', value.currentTimeStr)
    text('[data-music-duration]', value.durationStr)
    all('[data-music-progress]').forEach(input => {
      if (scrubber !== input) input.value = String(Math.round(value.progress * 10))
      input.style.setProperty('--range-progress', `${value.progress}%`)
      input.setAttribute('aria-valuetext', `${value.currentTimeStr} / ${value.durationStr}`)
    })
    document.getElementById('mistlane-music-orb')?.style.setProperty('--music-progress', String(value.progress))
  }

  const renderVolume = () => {
    const { volume, isMuted } = player.getState()
    all('[data-music-volume]').forEach(input => {
      input.value = String(Math.round(volume * 100))
      input.style.setProperty('--range-progress', `${isMuted ? 0 : volume * 100}%`)
    })
    all('[data-music-mute]').forEach(button => {
      button.querySelector('i').className = `fas ${isMuted || volume === 0 ? 'fa-volume-xmark' : volume < .5 ? 'fa-volume-low' : 'fa-volume-high'}`
      button.setAttribute('aria-label', isMuted ? '取消静音' : '静音')
      button.title = isMuted ? '取消静音' : '静音'
      button.setAttribute('aria-pressed', String(isMuted))
    })
  }

  const renderMode = () => {
    const { playMode } = player.getState()
    text('[data-music-mode-label]', modeLabels[playMode])
    all('[data-music-mode]').forEach(button => {
      button.title = modeLabels[playMode]
      button.setAttribute('aria-label', modeLabels[playMode])
      button.querySelector('i').className = `fas ${modeIcons[playMode]}`
    })
  }

  const centerLyric = (smooth = false) => {
    cancelAnimationFrame(lyricFrame)
    lyricFrame = requestAnimationFrame(() => {
      const list = document.querySelector('[data-music-lyrics]')
      const active = list?.querySelector('.is-current')
      if (!list) return
      // offsetTop is already relative to the lyric viewport. Use viewport
      // rectangles so page layout and entry animations cannot add an offset.
      const listRect = list.getBoundingClientRect()
      const activeRect = active?.getBoundingClientRect()
      const top = activeRect
        ? list.scrollTop + activeRect.top - listRect.top - list.clientTop - (list.clientHeight - activeRect.height) / 2
        : 0
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'true'
      list.scrollTo({ top: Math.max(0, top), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' })
    })
  }

  const fitLyricViewport = () => {
    const list = document.querySelector('[data-music-lyrics]')
    const lines = list?.querySelectorAll('[data-lyric-time]')
    if (!lines?.length) return
    // Let even the first and last line reach the middle, including wrapped
    // lyrics and changes in viewport size, site fonts or font size.
    list.style.paddingTop = `${Math.max(0, (list.clientHeight - lines[0].offsetHeight) / 2)}px`
    list.style.paddingBottom = `${Math.max(0, (list.clientHeight - lines[lines.length - 1].offsetHeight) / 2)}px`
    centerLyric()
  }

  const highlightLyric = (smooth = false) => {
    const state = player.getState()
    text('#mistlane-current-lyric', state.lyrics[state.currentLrcIndex]?.text || '让旋律陪你片刻')
    const list = document.querySelector('[data-music-lyrics]')
    if (!list) return
    list.querySelectorAll('[data-lyric-time]').forEach((line, index) => line.classList.toggle('is-current', index === state.currentLrcIndex))
    centerLyric(smooth)
  }

  const renderLyrics = () => {
    const { lyrics } = player.getState()
    lyricResizeObserver?.disconnect()
    // Update the pocket player's lyric even when the music room is absent.
    highlightLyric()
    const list = document.querySelector('[data-music-lyrics]')
    if (!list) return
    list.style.removeProperty('padding-top')
    list.style.removeProperty('padding-bottom')
    list.scrollTo({ top: 0, behavior: 'auto' })
    list.replaceChildren()
    if (!lyrics.length) {
      const placeholder = document.createElement('div')
      placeholder.className = 'music-lyrics-placeholder'
      placeholder.innerHTML = '<i class="fas fa-quote-left" aria-hidden="true"></i><p>让旋律说话，给思绪放个假。</p><small>这首歌暂时没有歌词，安心听就好。</small>'
      list.appendChild(placeholder)
    } else lyrics.forEach(line => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.lyricTime = String(line.time)
      button.textContent = line.text
      button.title = '从这一句开始听'
      list.appendChild(button)
    })
    highlightLyric()
    if (lyrics.length) {
      if (!lyricResizeObserver) lyricResizeObserver = new ResizeObserver(fitLyricViewport)
      lyricResizeObserver.observe(list)
      lyricResizeObserver.observe(list.firstElementChild)
      lyricResizeObserver.observe(list.lastElementChild)
      fitLyricViewport()
    }
  }

  window.addEventListener('fm:init', () => {
    if (!notice || notice === '正在整理歌单…') setNotice(player.getState().playlist.length ? '收藏喜欢的旋律，让它们陪你度过平常的一天。' : '歌单暂时为空。')
    renderPlaylist(); renderVolume(); renderMode()
  })
  window.addEventListener('fm:track', () => { renderTrack(); renderTime({ progress: 0, currentTimeStr: '0:00', durationStr: '0:00' }) })
  window.addEventListener('fm:play-state', () => {
    renderPlayState()
    if (player.getState().isPlaying && player.getState().error === null) setNotice('收藏喜欢的旋律，让它们陪你度过平常的一天。')
  })
  window.addEventListener('fm:time', event => renderTime(event.detail))
  window.addEventListener('fm:volume', renderVolume)
  window.addEventListener('fm:mode', renderMode)
  window.addEventListener('fm:lyrics', renderLyrics)
  window.addEventListener('fm:lrc-index', event => highlightLyric(!event.detail.immediate))
  window.addEventListener('fm:notice', event => setNotice(event.detail.message))
  window.addEventListener('fm:error', event => setNotice(event.detail.message))

  const runAction = async action => {
    try {
      if (!player.getState().initialized) {
        setNotice('正在整理歌单…')
        await player.init()
      }
      action()
    } catch { setNotice('音乐暂时没有准备好，请再试一次。') }
  }
  document.addEventListener('click', event => {
    const target = event.target
    const panel = document.getElementById('mistlane-music-panel')
    if (target.closest('#mistlane-music-orb')) return setPanel(!panel?.classList.contains('is-open'))
    if (target.closest('[data-close-music]')) return setPanel(false, true)
    const queueToggle = target.closest('[data-music-queue-toggle]')
    if (queueToggle) {
      const queue = document.getElementById('music-mini-queue')
      if (!queue) return
      const expanded = queueToggle.getAttribute('aria-expanded') !== 'true'
      queue.hidden = !expanded
      queueToggle.setAttribute('aria-expanded', String(expanded))
      queueToggle.title = expanded ? '收起歌单' : '展开歌单'
      queueToggle.setAttribute('aria-label', queueToggle.title)
      return
    }
    if (target.closest('[data-music-room-link]')) setPanel(false)
    if (panel?.classList.contains('is-open') && !target.closest('#mistlane-music-panel, .music-float-dock')) setPanel(false)
    if (target.closest('[data-music-play]')) return runAction(player.togglePlay)
    if (target.closest('[data-music-prev]')) return runAction(player.playPrev)
    if (target.closest('[data-music-next]')) return runAction(player.playNext)
    if (target.closest('[data-music-mode]')) return runAction(player.cyclePlayMode)
    if (target.closest('[data-music-mute]')) return player.toggleMute()
    const track = target.closest('[data-music-index]')
    if (track) return runAction(() => player.playTrackByIndex(Number(track.dataset.musicIndex)))
    const lyric = target.closest('[data-lyric-time]')
    if (lyric) player.seekToTime(Number(lyric.dataset.lyricTime))
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('mistlane-music-panel')?.classList.contains('is-open')) setPanel(false, true)
  })
  document.addEventListener('input', event => {
    if (event.target.matches('[data-music-volume]')) player.setVolume(Number(event.target.value) / 100)
    if (event.target.matches('[data-music-progress]')) player.seek(Number(event.target.value) / 1000)
    if (event.target.matches('[data-music-search]')) filterPlaylist()
  })
  document.addEventListener('pointerdown', event => { if (event.target.matches('[data-music-progress]')) scrubber = event.target })
  document.addEventListener('pointerup', () => { scrubber = null })
  document.addEventListener('pointercancel', () => { scrubber = null })
  document.addEventListener('pjax:send', () => {
    scrubber = null
    cancelAnimationFrame(lyricFrame)
    lyricResizeObserver?.disconnect()
    setPanel(false)
  })

  if ('mediaSession' in navigator) {
    const actions = {
      play: () => { if (player.audio.paused) runAction(player.togglePlay) },
      pause: () => player.audio.pause(), previoustrack: player.playPrev, nexttrack: player.playNext,
      seekto: detail => player.seekToTime(detail.seekTime)
    }
    Object.entries(actions).forEach(([name, action]) => { try { navigator.mediaSession.setActionHandler(name, action) } catch { /* Unsupported media action. */ } })
  }

  onMount(() => {
    const inRoom = Boolean(document.getElementById('music-room'))
    document.documentElement.classList.toggle('music-room-active', inRoom)
    if (inRoom && !player.getState().initialized) player.init()
    renderPlaylist(); renderVolume(); renderMode(); renderTime(); renderPlayState()
    if (player.getState().initialized) renderLyrics()
    text('[data-music-notice]', notice || '正在整理歌单…')
  })
}
