// Shared, cached data loaders. The catalog is consumed by the archive hub,
// the category overview and the category detail pages; fetching once per
// document avoids repeated requests during PJAX navigation.

let catalogPromise = null

export const loadCategoryCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/category-cards.json')
      .then(response => (response.ok ? response.json() : {}))
      .catch(() => ({}))
  }
  return catalogPromise
}
