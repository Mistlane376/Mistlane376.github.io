// JSON-backed localStorage helpers shared by the Mistlane features.
// Storage failures (private mode, quota) never break a feature.

export const readLocal = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The feature keeps working for the current page when storage is unavailable.
  }
}
