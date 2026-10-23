export const createElement = (tag, className, text) => {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined && text !== null) element.textContent = text
  return element
}

export const createIcon = className => {
  const icon = createElement('i', className)
  icon.setAttribute('aria-hidden', 'true')
  return icon
}

export const safeText = value => (typeof value === 'string' ? value.trim() : '')
