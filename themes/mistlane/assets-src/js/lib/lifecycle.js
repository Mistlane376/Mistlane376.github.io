// Unified mount lifecycle for Mistlane feature modules.
//
// Every feature registers a mount callback via onMount(). The entry of each
// bundle calls startLifecycle() as its last statement, after all features of
// that bundle have registered: this is important because the bundles are
// deferred scripts, which evaluate after the document has been parsed but
// before DOMContentLoaded fires, so a fixed "run at DOMContentLoaded" hook
// would flush the queue before any feature could register.
//
// Mount callbacks run once on start and again after each PJAX navigation so
// features survive the SPA-like page swaps. They must be idempotent: each
// callback is responsible for its own "already bound" guards.
const mounts = []
let started = false

const runSafe = fn => {
  try {
    fn()
  } catch (error) {
    console.error('[mistlane]', error)
  }
}

export const onMount = fn => {
  mounts.push(fn)
  if (started) runSafe(fn)
}

export const startLifecycle = () => {
  if (started) return
  const flush = () => {
    started = true
    mounts.forEach(runSafe)
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', flush, { once: true })
  } else {
    flush()
  }
  document.addEventListener('pjax:complete', () => mounts.forEach(runSafe))
}
