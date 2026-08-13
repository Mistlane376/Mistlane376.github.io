(() => {
  'use strict'

  const parseLineSpec = spec => {
    const lines = new Set()
    String(spec || '').split(',').forEach(part => {
      const match = part.trim().match(/^(\d+)(?:-(\d+))?$/)
      if (!match) return
      const start = Number(match[1])
      const end = Number(match[2] || match[1])
      for (let line = Math.min(start, end); line <= Math.max(start, end); line += 1) lines.add(line)
    })
    return lines
  }

  const initCodeBlocks = () => {
    document.querySelectorAll('#article-container figure.highlight').forEach(block => {
      if (block.dataset.mistlaneEnhanced === 'true') return
      block.dataset.mistlaneEnhanced = 'true'

      const tools = block.querySelector('.highlight-tools')
      const code = block.querySelector('.code pre')
      const source = block.querySelector('code') || code
      const caption = block.querySelector('figcaption, .caption')
      const rawMeta = block.getAttribute('data-meta') || source?.getAttribute('data-meta') || ''
      const titleMatch = rawMeta.match(/(?:title|file|filename)=["']?([^"'\s}]+)/i)
      const linesMatch = rawMeta.match(/(?:highlight|lines)=\{?([\d,\-]+)\}?/i)

      const fileName = titleMatch?.[1] || caption?.textContent.trim()
      if (tools && fileName) {
        const title = document.createElement('span')
        title.className = 'mistlane-code-file'
        title.textContent = fileName
        tools.insertBefore(title, tools.querySelector('.copy-button, .fullpage-button'))
        if (caption) caption.hidden = true
      }

      const rowCount = code ? code.querySelectorAll('.line').length : 0
      if (rowCount > 24) {
        block.classList.add('mistlane-code-long')
        const toggle = document.createElement('button')
        toggle.type = 'button'
        toggle.className = 'mistlane-code-toggle'
        toggle.innerHTML = '<i class="fas fa-angles-down"></i><span>展开完整代码</span>'
        toggle.addEventListener('click', () => {
          const expanded = block.classList.toggle('expand-done')
          toggle.querySelector('i').className = expanded ? 'fas fa-angles-up' : 'fas fa-angles-down'
          toggle.querySelector('span').textContent = expanded ? '收起代码' : '展开完整代码'
        })
        block.appendChild(toggle)
      }

      if (code && linesMatch) {
        block.dataset.highlightLines = linesMatch[1]
        const selected = parseLineSpec(linesMatch[1])
        code.querySelectorAll('.line').forEach((line, index) => line.classList.toggle('is-emphasized', selected.has(index + 1)))
      }

      const copy = tools?.querySelector('.copy-button')
      if (copy) {
        copy.addEventListener('click', () => {
          copy.classList.add('is-copied')
          setTimeout(() => copy.classList.remove('is-copied'), 1300)
        })
      }
    })
  }

  document.addEventListener('DOMContentLoaded', initCodeBlocks)
  document.addEventListener('pjax:complete', initCodeBlocks)
})()
