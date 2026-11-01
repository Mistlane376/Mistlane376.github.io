import { readLocal, writeLocal } from '../lib/storage'
import { bindMusicViews } from './music-views'

const audio = document.getElementById('mistlane-global-audio')

if (audio) {
  const VOLUME_KEY = 'mistlane-music-volume'
  const modeNames = ['list', 'one', 'random']
  let loadVersion = 0
  let trackUrls = []
  let trackUrlIndex = 0
  let errorSkipTimer = null
  let initPromise = null
  let failedTracks = 0

  const state = {
    config: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    playMode: 0,
    volume: Number(readLocal(VOLUME_KEY, 0.35)),
    isMuted: false,
    lyrics: [],
    currentLrcIndex: -1,
    initialized: false,
    initializing: false,
    error: null
  }

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
    duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    progress: audio.duration > 0 && Number.isFinite(audio.duration) ? audio.currentTime / audio.duration * 100 : 0,
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
      const fraction = match[3] ? Number(match[3]) / (10 ** match[3].length) : 0
      return { time: Number(match[1]) * 60 + Number(match[2]) + fraction, text }
    })
  }).filter(line => line.text).sort((a, b) => a.time - b.time)

  const lyricIndexAt = time => {
    let index = -1
    for (let i = 0; i < state.lyrics.length; i += 1) {
      if (time < state.lyrics[i].time) break
      index = i
    }
    return index
  }
  const syncLyrics = (immediate = false) => {
    const index = lyricIndexAt(audio.currentTime || 0)
    if (index === state.currentLrcIndex && !immediate) return
    state.currentLrcIndex = index
    emit('fm:lrc-index', { index, immediate })
  }
  const publishLyrics = (lyrics, status, time = audio.currentTime || 0) => {
    state.lyrics = lyrics
    state.currentLrcIndex = lyricIndexAt(time)
    emit('fm:lyrics', { lyrics, status })
  }

  const loadLyrics = (track, version) => {
    state.lyrics = []
    state.currentLrcIndex = -1
    if (!track?.lrc) return emit('fm:lyrics', { lyrics: [], status: 'none' })
    const remote = /^(https?:)?\/\//.test(track.lrc) || track.lrc.startsWith('/') || /\.(lrc|txt)(\?|#|$)/i.test(track.lrc)
    if (!remote) {
      const lyrics = parseLrc(track.lrc)
      return publishLyrics(lyrics, lyrics.length ? 'loaded' : 'none', 0)
    }
    emit('fm:lyrics', { lyrics: [], status: 'loading' })
    fetch(track.lrc, { signal: AbortSignal.timeout(10000) })
      .then(response => (response.ok ? response.text() : Promise.reject(response.status)))
      .then(text => {
        if (version !== loadVersion) return
        const lyrics = parseLrc(text)
        publishLyrics(lyrics, lyrics.length ? 'loaded' : 'none')
      })
      .catch(() => { if (version === loadVersion) emit('fm:lyrics', { lyrics: [], status: 'failed' }) })
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
      failedTracks = 0
      emit('fm:play-state', { isPlaying: true })
    }).catch(error => {
      if (version !== loadVersion || error.name === 'AbortError') return
      state.isPlaying = false
      emit('fm:play-state', { isPlaying: false })
      if (error.name === 'NotAllowedError') emit('fm:error', { message: '请再次点击播放，开始聆听' })
    })
  }

  const loadTrack = (index, autoPlay = false) => {
    if (index < 0 || index >= state.playlist.length) return
    if (typeof index !== 'number' || !Number.isInteger(index)) return
    audio.pause()
    state.currentIndex = index
    state.error = null
    const track = currentTrack()
    const version = ++loadVersion
    if (errorSkipTimer) clearTimeout(errorSkipTimer)
    errorSkipTimer = null
    trackUrls = deriveFallbackUrls(track)
    trackUrlIndex = 0
    loadLyrics(track, version)
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
    if (!Number.isFinite(Number(value))) return
    state.volume = Math.max(0, Math.min(1, Number(value)))
    state.isMuted = false
    audio.volume = state.volume
    audio.muted = false
    writeLocal(VOLUME_KEY, state.volume)
    emit('fm:volume', { volume: state.volume, isMuted: false })
  }
  const toggleMute = () => {
    state.isMuted = !state.isMuted
    audio.muted = state.isMuted
    emit('fm:volume', { volume: state.volume, isMuted: state.isMuted })
  }
  const seek = percent => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0 || !Number.isFinite(percent)) return
    audio.currentTime = Math.max(0, Math.min(1, percent)) * audio.duration
    syncLyrics(true)
  }
  const seekToTime = time => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0 || !Number.isFinite(Number(time))) return
    audio.currentTime = Math.max(0, Math.min(Number(time), audio.duration))
    syncLyrics(true)
  }
  const playTrackByIndex = index => (index === state.currentIndex && !audio.paused ? togglePlay() : loadTrack(index, true))

  const handleAudioError = version => {
    if (version !== loadVersion) return
    if (trackUrlIndex < trackUrls.length - 1) {
      trackUrlIndex += 1
      emit('fm:fallback', { url: trackUrls[trackUrlIndex] })
      return tryTrackUrl(true, version)
    }
    state.isPlaying = false
    failedTracks += 1
    const canSkip = failedTracks < state.playlist.length && state.playlist.length > 1
    state.error = canSkip ? '这首暂时无法播放，即将尝试下一首' : '暂时无法播放，请稍后重试或选择其他歌曲'
    emit('fm:play-state', { isPlaying: false })
    emit('fm:error', { message: state.error })
    if (errorSkipTimer) clearTimeout(errorSkipTimer)
    errorSkipTimer = setTimeout(() => {
      if (version === loadVersion && canSkip) loadTrack((state.currentIndex + 1) % state.playlist.length, true)
    }, 2000)
  }

  const fetchMetingData = async meting => {
    for (const api of [meting.api, ...(meting.fallbackApis || [])].filter(Boolean)) {
      try {
        let requestUrl = interpolateApi(api, meting)
        if (meting.auth) requestUrl += `&auth=${encodeURIComponent(meting.auth)}`
        const response = await fetch(requestUrl, { signal: AbortSignal.timeout(6500) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        const playlist = (Array.isArray(data) ? data : data.data || []).map(normalizeTrack).filter(track => track.url)
        if (playlist.length) return playlist
      } catch (error) { console.warn('[music] Meting API failed:', api, error) }
    }
    throw new Error('所有 Meting API 均不可用')
  }

  const initialize = async () => {
    state.initializing = true
    try {
      const response = await fetch('/data/music.json', { signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      state.config = await response.json()
      state.playMode = Math.max(0, modeNames.indexOf(state.config.playMode === 'loop' ? 'one' : state.config.playMode))
      state.volume = Number.isFinite(state.volume) ? Math.max(0, Math.min(1, state.volume)) : (state.config.volume ?? 0.35)
      audio.volume = state.volume
      if (state.config.enabled === false) throw new Error('音乐暂未开放')
      const local = (state.config.local?.playlist || []).map(normalizeTrack).filter(track => track.url)
      if (state.config.mode === 'meting') {
        try { state.playlist = await fetchMetingData(state.config.meting || {}) }
        catch (error) {
          if (!local.length) throw error
          state.playlist = local
          emit('fm:notice', { message: '在线歌单暂不可用，正在收听私藏音乐。' })
        }
      } else state.playlist = local
      state.initialized = true
      emit('fm:init', { playlist: state.playlist, playMode: state.playMode, volume: state.volume, isMuted: false })
      if (state.playlist.length) {
        const startIndex = state.playMode === 2 ? Math.floor(Math.random() * state.playlist.length) : 0
        loadTrack(startIndex, false)
      } else emit('fm:error', { message: '歌单为空' })
    } catch (error) {
      state.initialized = false
      state.error = error.message || '音乐加载失败'
      emit('fm:init', { playlist: [], playMode: state.playMode, volume: state.volume, isMuted: false })
      emit('fm:error', { message: state.error })
    } finally { state.initializing = false }
  }

  // Keep the same audio node and state throughout PJAX navigation.
  const init = () => {
    if (state.initialized) return Promise.resolve()
    if (!initPromise || !state.initializing) initPromise = initialize()
    return initPromise
  }

  audio.addEventListener('play', () => {
    state.isPlaying = true
    state.error = null
    emit('fm:play-state', { isPlaying: true })
  })
  audio.addEventListener('playing', () => { failedTracks = 0 })
  audio.addEventListener('pause', () => { state.isPlaying = false; emit('fm:play-state', { isPlaying: false }) })
  const emitTime = () => emit('fm:time', {
    currentTime: audio.currentTime || 0, duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    progress: audio.duration > 0 && Number.isFinite(audio.duration) ? audio.currentTime / audio.duration * 100 : 0,
    currentTimeStr: formatTime(audio.currentTime), durationStr: formatTime(audio.duration)
  })
  audio.addEventListener('timeupdate', () => {
    emitTime()
    syncLyrics()
  })
  audio.addEventListener('loadedmetadata', () => { emitTime(); syncLyrics(true) })
  audio.addEventListener('seeking', () => { emitTime(); syncLyrics(true) })
  audio.addEventListener('seeked', () => { emitTime(); syncLyrics(true) })
  audio.addEventListener('ended', () => playNext(true))
  audio.addEventListener('error', () => handleAudioError(loadVersion))

  window.MistlaneMusic = {
    audio, init, getState, togglePlay, playNext: () => playNext(false), playPrev,
    cyclePlayMode, setVolume, toggleMute, seek, seekToTime, playTrackByIndex, loadTrack
  }
  bindMusicViews(window.MistlaneMusic)
}
