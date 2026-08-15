(() => {
  'use strict'
  if (window.MistlaneMusic) return

  const audio = document.getElementById('mistlane-global-audio')
  if (!audio) return

  const VOLUME_KEY = 'mistlane-music-volume'
  const modeNames = ['list', 'one', 'random']
  const modeLabels = ['顺序播放', '单曲循环', '随机播放']
  const modeIcons = ['fas fa-repeat', 'fas fa-repeat-1', 'fas fa-shuffle']
  let loadVersion = 0
  let trackUrls = []
  let trackUrlIndex = 0
  let errorSkipTimer = null

  const state = {
    config: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    playMode: 0,
    volume: Number(localStorage.getItem(VOLUME_KEY) ?? .35),
    isMuted: false,
    lyrics: [],
    currentLrcIndex: -1,
    initialized: false,
    initializing: false,
    error: null
  }

  const $ = selector => document.querySelector(selector)
  const currentTrack = () => state.playlist[state.currentIndex] || null
  const absoluteUrl = value => new URL(value, window.location.href).href
  const formatTime = seconds => Number.isFinite(seconds) && seconds > 0
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
    : '0:00'
  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, { detail }))

  const getState = () => ({
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    track: currentTrack(),
    isPlaying: state.isPlaying,
    playMode: state.playMode,
    volume: state.volume,
    isMuted: state.isMuted,
    currentTime: audio.currentTime || 0,
    duration: audio.duration || 0,
    progress: audio.duration ? audio.currentTime / audio.duration * 100 : 0,
    currentTimeStr: formatTime(audio.currentTime),
    durationStr: formatTime(audio.duration),
    lyrics: state.lyrics,
    currentLrcIndex: state.currentLrcIndex,
    initialized: state.initialized,
    error: state.error,
    config: state.config
  })

  const normalizeTrack = track => ({
    name: track.name || track.title || '未知歌曲',
    artist: track.artist || track.author || '未知歌手',
    url: track.url || '',
    pic: track.pic || track.cover || '',
    lrc: track.lrc || track.lyric || '',
    fallbackUrls: Array.isArray(track.fallbackUrls) ? track.fallbackUrls : []
  })

  const parseLrc = lrc => lrc.split(/\r?\n/).flatMap(line => {
    const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)]
    const text = line.replace(/\[[^\]]+\]/g, '').trim()
    return matches.map(match => {
      const fraction = match[3] ? Number(match[3]) / (match[3].length === 3 ? 1000 : 100) : 0
      return { time: Number(match[1]) * 60 + Number(match[2]) + fraction, text }
    })
  }).filter(line => line.text).sort((a, b) => a.time - b.time)

  const loadLyrics = track => {
    state.lyrics = []
    state.currentLrcIndex = -1
    if (!track?.lrc) return emit('fm:lyrics', { lyrics: [], status: 'none' })
    const remote = /^(https?:)?\/\//.test(track.lrc) || track.lrc.startsWith('/') || /\.(lrc|txt)(\?|#|$)/i.test(track.lrc)
    if (!remote) {
      state.lyrics = parseLrc(track.lrc)
      return emit('fm:lyrics', { lyrics: state.lyrics, status: state.lyrics.length ? 'loaded' : 'none' })
    }
    emit('fm:lyrics', { lyrics: [], status: 'loading' })
    fetch(track.lrc)
      .then(response => response.ok ? response.text() : Promise.reject(response.status))
      .then(text => {
        state.lyrics = parseLrc(text)
        emit('fm:lyrics', { lyrics: state.lyrics, status: 'loaded' })
      })
      .catch(() => emit('fm:lyrics', { lyrics: [], status: 'failed' }))
  }

  const interpolateApi = (template, meting, type = meting.type, id = meting.id, server = meting.server) => template
    .replace(':server', encodeURIComponent(server || ''))
    .replace(':type', encodeURIComponent(type || ''))
    .replace(':id', encodeURIComponent(id || ''))
    .replace(':r', String(Math.random()))

  const deriveFallbackUrls = track => {
    const urls = [track.url, ...track.fallbackUrls].filter(Boolean)
    const meting = state.config?.meting
    if (!meting?.fallbackApis?.length || !track.url) return [...new Set(urls)]
    const parsed = new URL(track.url, window.location.href)
    const id = parsed.searchParams.get('id')
    const server = parsed.searchParams.get('server') || meting.server
    if (id && server) meting.fallbackApis.forEach(api => urls.push(interpolateApi(api, meting, 'url', id, server)))
    return [...new Set(urls)]
  }

  const tryTrackUrl = (autoPlay, version) => {
    if (version !== loadVersion || !trackUrls[trackUrlIndex]) return
    audio.src = absoluteUrl(trackUrls[trackUrlIndex])
    if (!autoPlay) {
      state.isPlaying = false
      emit('fm:play-state', { isPlaying: false })
      return
    }
    audio.play().then(() => {
      if (version !== loadVersion) return
      state.isPlaying = true
      state.error = null
      emit('fm:play-state', { isPlaying: true })
    }).catch(error => {
      if (version !== loadVersion || error.name === 'AbortError') return
      emit('fm:play-state', { isPlaying: false })
    })
  }

  const loadTrack = (index, autoPlay = false) => {
    if (index < 0 || index >= state.playlist.length) return
    state.currentIndex = index
    state.error = null
    const track = currentTrack()
    const version = ++loadVersion
    if (errorSkipTimer) clearTimeout(errorSkipTimer)
    errorSkipTimer = null
    trackUrls = deriveFallbackUrls(track)
    trackUrlIndex = 0
    loadLyrics(track)
    emit('fm:track', { index, track, autoPlay: Boolean(autoPlay) })
    if (!trackUrls.length) return handleAudioError(version)
    tryTrackUrl(autoPlay, version)
  }

  const playNext = automatic => {
    if (!state.playlist.length) return
    if (state.playMode === 1 && automatic) {
      audio.currentTime = 0
      audio.play().catch(() => {})
      return
    }
    const index = state.playMode === 2
      ? Math.floor(Math.random() * state.playlist.length)
      : (state.currentIndex + 1) % state.playlist.length
    loadTrack(index, true)
  }
  const playPrev = () => {
    if (!state.playlist.length) return
    const index = state.playMode === 2
      ? Math.floor(Math.random() * state.playlist.length)
      : (state.currentIndex - 1 + state.playlist.length) % state.playlist.length
    loadTrack(index, true)
  }
  const togglePlay = () => {
    if (!currentTrack()) return
    if (!audio.src) return loadTrack(state.currentIndex, true)
    if (audio.paused) audio.play().catch(error => error.name !== 'AbortError' && emit('fm:error', { message: '播放失败，请稍后重试' }))
    else audio.pause()
  }
  const cyclePlayMode = () => {
    state.playMode = (state.playMode + 1) % 3
    emit('fm:mode', { playMode: state.playMode })
  }
  const setVolume = value => {
    state.volume = Math.max(0, Math.min(1, Number(value)))
    state.isMuted = false
    audio.volume = state.volume
    audio.muted = false
    localStorage.setItem(VOLUME_KEY, String(state.volume))
    emit('fm:volume', { volume: state.volume, isMuted: false })
  }
  const toggleMute = () => {
    state.isMuted = !state.isMuted
    audio.muted = state.isMuted
    emit('fm:volume', { volume: state.volume, isMuted: state.isMuted })
  }
  const seek = percent => {
    if (audio.duration) audio.currentTime = Math.max(0, Math.min(1, percent)) * audio.duration
  }
  const seekToTime = time => {
    if (audio.duration) audio.currentTime = Math.max(0, Math.min(Number(time), audio.duration))
  }
  const playTrackByIndex = index => index === state.currentIndex && !audio.paused ? togglePlay() : loadTrack(index, true)

  const handleAudioError = version => {
    if (version !== loadVersion) return
    if (trackUrlIndex < trackUrls.length - 1) {
      trackUrlIndex += 1
      emit('fm:fallback', { url: trackUrls[trackUrlIndex] })
      return tryTrackUrl(true, version)
    }
    state.isPlaying = false
    state.error = '播放失败，即将自动切换歌曲'
    emit('fm:error', { message: state.error })
    if (errorSkipTimer) clearTimeout(errorSkipTimer)
    errorSkipTimer = setTimeout(() => {
      if (version === loadVersion && state.playlist.length > 1) playNext(true)
    }, 2000)
  }

  const fetchMetingData = async meting => {
    for (const api of [meting.api, ...(meting.fallbackApis || [])].filter(Boolean)) {
      try {
        let requestUrl = interpolateApi(api, meting)
        if (meting.auth) requestUrl += `&auth=${encodeURIComponent(meting.auth)}`
        const response = await fetch(requestUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        const playlist = (Array.isArray(data) ? data : data.data || []).map(normalizeTrack).filter(track => track.url)
        if (playlist.length) return playlist
      } catch (error) { console.warn('[music] Meting API failed:', api, error) }
    }
    throw new Error('所有 Meting API 均不可用')
  }

  const init = async () => {
    if (state.initialized || state.initializing) return
    state.initializing = true
    try {
      const response = await fetch('/data/music.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      state.config = await response.json()
      state.playMode = Math.max(0, modeNames.indexOf(state.config.playMode === 'loop' ? 'one' : state.config.playMode))
      state.volume = Number.isFinite(state.volume) ? Math.max(0, Math.min(1, state.volume)) : (state.config.volume ?? .35)
      audio.volume = state.volume
      state.playlist = state.config.mode === 'meting'
        ? await fetchMetingData(state.config.meting || {})
        : (state.config.local?.playlist || []).map(normalizeTrack).filter(track => track.url)
      state.initialized = true
      emit('fm:init', { playlist: state.playlist, playMode: state.playMode, volume: state.volume, isMuted: false })
      if (state.playlist.length) {
        const startIndex = state.playMode === 2 ? Math.floor(Math.random() * state.playlist.length) : 0
        loadTrack(startIndex, false)
      } else emit('fm:error', { message: '歌单为空' })
    } catch (error) {
      state.initialized = true
      state.error = error.message || '音乐加载失败'
      emit('fm:init', { playlist: [], playMode: state.playMode, volume: state.volume, isMuted: false })
      emit('fm:error', { message: state.error })
    } finally { state.initializing = false }
  }

  const setPanel = open => {
    const panel = $('#mistlane-music-panel')
    if (!panel) return
    panel.classList.toggle('is-open', open)
    panel.setAttribute('aria-hidden', String(!open))
    document.querySelectorAll('#nav-music-button').forEach(button => button.setAttribute('aria-expanded', String(open)))
  }

  const renderPlaylist = (playlist, activeIndex) => {
    const list = $('#mistlane-playlist')
    if (!list) return
    list.replaceChildren(...playlist.map((track, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.musicIndex = String(index)
      button.classList.toggle('is-active', index === activeIndex)
      button.innerHTML = '<i class="fas fa-music" aria-hidden="true"></i><span></span>'
      button.querySelector('span').textContent = `${track.name} · ${track.artist}`
      return button
    }))
  }
  const renderTrack = (track, index) => {
    const name = $('#mistlane-track-name')
    const artist = $('#mistlane-track-artist')
    const cover = $('.mistlane-track-cover')
    if (name) name.textContent = track?.name || '暂无歌曲'
    if (artist) artist.textContent = track?.artist || '未知歌手'
    if (cover) {
      cover.classList.toggle('has-cover', Boolean(track?.pic))
      cover.style.backgroundImage = track?.pic ? `url("${track.pic.replace(/"/g, '%22')}")` : ''
    }
    document.querySelectorAll('#mistlane-playlist button').forEach((button, i) => button.classList.toggle('is-active', i === index))
  }
  const renderPlayState = playing => {
    const icon = $('[data-music-play] i')
    if (icon) icon.className = playing ? 'fas fa-pause' : 'fas fa-play'
    document.querySelectorAll('#nav-music-button').forEach(button => button.classList.toggle('is-playing', playing))
  }
  const renderMode = mode => {
    const button = $('[data-music-mode]')
    if (!button) return
    button.title = modeLabels[mode]
    button.setAttribute('aria-label', modeLabels[mode])
    button.querySelector('i').className = modeIcons[mode]
  }
  const renderVolume = (volume, muted) => {
    const input = $('#mistlane-music-volume')
    if (input && document.activeElement !== input) input.value = String(Math.round(volume * 100))
    const icon = $('[data-music-mute] i')
    if (icon) icon.className = muted || volume === 0 ? 'fas fa-volume-xmark' : volume < .5 ? 'fas fa-volume-low' : 'fas fa-volume-high'
  }
  const syncView = () => {
    const value = getState()
    if (!value.initialized) return
    renderPlaylist(value.playlist, value.currentIndex)
    renderTrack(value.track, value.currentIndex)
    renderPlayState(value.isPlaying)
    renderMode(value.playMode)
    renderVolume(value.volume, value.isMuted)
    const elapsed = $('#mistlane-current-time')
    const duration = $('#mistlane-duration')
    const progress = $('#mistlane-music-progress')
    if (elapsed) elapsed.textContent = value.currentTimeStr
    if (duration) duration.textContent = value.durationStr
    if (progress) progress.value = String(Math.round(value.progress * 10))
  }

  window.addEventListener('fm:init', event => {
    renderPlaylist(event.detail.playlist, 0)
    renderMode(event.detail.playMode)
    renderVolume(event.detail.volume, event.detail.isMuted)
  })
  window.addEventListener('fm:track', event => renderTrack(event.detail.track, event.detail.index))
  window.addEventListener('fm:play-state', event => renderPlayState(event.detail.isPlaying))
  window.addEventListener('fm:time', event => {
    const progress = $('#mistlane-music-progress')
    const elapsed = $('#mistlane-current-time')
    const duration = $('#mistlane-duration')
    if (progress) progress.value = String(Math.round(event.detail.progress * 10))
    if (elapsed) elapsed.textContent = event.detail.currentTimeStr
    if (duration) duration.textContent = event.detail.durationStr
  })
  window.addEventListener('fm:volume', event => renderVolume(event.detail.volume, event.detail.isMuted))
  window.addEventListener('fm:mode', event => renderMode(event.detail.playMode))
  window.addEventListener('fm:lrc-index', event => {
    const lyric = $('#mistlane-current-lyric')
    if (lyric) lyric.textContent = state.lyrics[event.detail.index]?.text || '暂无歌词'
  })
  window.addEventListener('fm:error', event => {
    const artist = $('#mistlane-track-artist')
    if (artist) artist.textContent = event.detail.message
  })

  document.addEventListener('click', event => {
    const nav = event.target.closest('#nav-music-button')
    if (nav) return setPanel(!$('#mistlane-music-panel')?.classList.contains('is-open'))
    if (event.target.closest('[data-close-music]')) return setPanel(false)
    if (event.target.closest('[data-music-play]')) return togglePlay()
    if (event.target.closest('[data-music-prev]')) return playPrev()
    if (event.target.closest('[data-music-next]')) return playNext(false)
    if (event.target.closest('[data-music-mode]')) return cyclePlayMode()
    if (event.target.closest('[data-music-mute]')) return toggleMute()
    const item = event.target.closest('[data-music-index]')
    if (item) playTrackByIndex(Number(item.dataset.musicIndex))
  })
  document.addEventListener('input', event => {
    if (event.target.matches('#mistlane-music-volume')) setVolume(Number(event.target.value) / 100)
    if (event.target.matches('#mistlane-music-progress')) seek(Number(event.target.value) / 1000)
  })
  audio.addEventListener('play', () => { state.isPlaying = true; emit('fm:play-state', { isPlaying: true }) })
  audio.addEventListener('pause', () => { state.isPlaying = false; emit('fm:play-state', { isPlaying: false }) })
  audio.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audio.duration)) return
    emit('fm:time', {
      currentTime: audio.currentTime, duration: audio.duration, progress: audio.currentTime / audio.duration * 100,
      currentTimeStr: formatTime(audio.currentTime), durationStr: formatTime(audio.duration)
    })
    let index = -1
    for (let i = 0; i < state.lyrics.length; i += 1) {
      if (audio.currentTime >= state.lyrics[i].time) index = i
      else break
    }
    if (index !== state.currentLrcIndex) {
      state.currentLrcIndex = index
      emit('fm:lrc-index', { index })
    }
  })
  audio.addEventListener('ended', () => playNext(true))
  audio.addEventListener('error', () => handleAudioError(loadVersion))
  document.addEventListener('pjax:complete', syncView)

  window.MistlaneMusic = {
    audio, init, getState, togglePlay, playNext: () => playNext(false), playPrev,
    cyclePlayMode, setVolume, toggleMute, seek, seekToTime, playTrackByIndex, loadTrack, setPanel
  }
  init()
})()
