// Always-loaded bundle: ambient effects, appearance settings, the global
// music player kernel, search panel animation, visitor greeting, RSS copy
// helper, the vendor CDN fallback and the PJAX asset loader.
import { startLifecycle } from './lib/lifecycle'
import { watchPageAssets } from './lib/page-assets'
import './features/effects'
import './features/appearance'
import './features/music'
import './features/search-animation'
import './features/visitor-welcome'
import './features/rss'
import './features/vendor-fallback'

watchPageAssets()
startLifecycle()
