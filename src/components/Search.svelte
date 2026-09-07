<script>
  import { onMount, tick } from 'svelte';
  let open = $state(false);
  let query = $state('');
  let entries = $state([]);
  let loading = $state(false);
  let error = $state('');
  let current = $state(1);
  let input;
  let dialog;
  let opener;
  let loaded = false;
  let controller;
  let previousOverflow = '';
  const pageSize = 10;
  const words = $derived(query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean));
  const matches = $derived(words.length ? entries.filter(entry => words.every(word => entry.search.includes(word))) : []);
  const pages = $derived(Math.ceil(matches.length / pageSize));
  const visible = $derived(matches.slice((current - 1) * pageSize, current * pageSize));
  function excerpt(text) {
    const index = text.toLocaleLowerCase().indexOf(words[0] || '');
    const start = Math.max(0, index - 50);
    return (start ? '…' : '') + text.slice(start, start + 180) + (text.length > start + 180 ? '…' : '');
  }
  async function loadIndex() {
    if (loaded || loading) return;
    loading = true;
    error = '';
    controller = new AbortController();
    try {
      const response = await fetch('/data/search.json', { signal: controller.signal });
      if (!response.ok) throw new Error('Search request failed');
      entries = (await response.json()).filter(entry => typeof entry.url === 'string' && entry.url.startsWith('/') && !entry.url.startsWith('//')).map(entry => ({ ...entry, search: `${entry.title} ${entry.text}`.toLocaleLowerCase() }));
      loaded = true;
    } catch (cause) {
      if (cause.name !== 'AbortError') error = '搜索索引加载失败，请重试。';
    } finally { loading = false; }
  }
  async function show(trigger) {
    if (open) return;
    opener = trigger;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    open = true;
    loadIndex();
    await tick();
    input?.focus();
  }
  function close(restoreFocus = true) {
    if (!open) return;
    open = false;
    document.body.style.overflow = previousOverflow;
    if (restoreFocus) opener?.focus({ preventScroll: true });
  }
  onMount(() => {
    const click = event => {
      const trigger = event.target.closest('#search-button .search');
      if (trigger) { event.preventDefault(); show(trigger); }
    };
    const keydown = event => {
      if (!open) return;
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('button:not(:disabled), input, a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const navigate = () => close(false);
    document.addEventListener('click', click);
    document.addEventListener('keydown', keydown);
    document.addEventListener('pjax:send', navigate);
    return () => {
      controller?.abort();
      close(false);
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pjax:send', navigate);
    };
  });
  // PJAX discovers links once; refresh only after Svelte has rendered new results.
  $effect(() => {
    visible;
    tick().then(() => window.pjax?.refresh(dialog));
  });
</script>

<div id="local-search">
  <section bind:this={dialog} class="search-dialog" role="dialog" aria-modal="true" aria-label="站内搜索" tabindex="-1" style:display={open ? 'block' : 'none'}>
    <nav class="search-nav"><span class="search-dialog-title">搜索</span><button class="search-close-button" type="button" aria-label="关闭搜索" onclick={() => close()}><i class="fas fa-times" aria-hidden="true"></i></button></nav>
    {#if loading}<div id="loading-database" class="text-center" role="status">正在加载搜索索引…</div>{/if}
    {#if error}<p role="alert">{error} <button type="button" onclick={loadIndex}>重试</button></p>{/if}
    <div class="local-search-input"><input bind:this={input} bind:value={query} oninput={() => current = 1} placeholder="搜索文章" aria-label="搜索文章" type="search" /></div>
    <hr />
    <div id="local-search-results"><ol class="search-result-list">{#each visible as entry, index (entry.url)}<li class="local-search-hit-item" value={(current - 1) * pageSize + index + 1}><a href={entry.url} onclick={() => close(false)}><span class="search-result-title">{entry.title}</span><p class="search-result">{excerpt(entry.text)}</p></a></li>{/each}</ol></div>
    {#if pages > 1}<nav id="local-search-pagination" class="ais-Pagination" aria-label="搜索结果分页"><ul class="ais-Pagination-list">{#each Array(pages) as _, index}<li class:ais-Pagination-item--selected={current === index + 1} class="ais-Pagination-item"><button class="ais-Pagination-link" type="button" aria-label={`第 ${index + 1} 页`} aria-current={current === index + 1 ? 'page' : undefined} onclick={() => current = index + 1}>{index + 1}</button></li>{/each}</ul></nav>{/if}
    <div id="local-search-stats" role="status"><span class="search-result-stats">{words.length ? `找到 ${matches.length} 篇文章` : '输入关键词搜索文章'}</span></div>
  </section>
  <button id="search-mask" type="button" tabindex="-1" aria-label="关闭搜索" style:display={open ? 'block' : 'none'} onclick={() => close()}></button>
</div>
