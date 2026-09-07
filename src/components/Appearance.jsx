import { useEffect, useRef, useState } from 'react';

const key = 'mistlane-appearance-v2';
const defaults = { font: 'system', colorMode: 'auto', fontSize: 100, reduceMotion: false };
const fonts = [['system', '默认字体', 'System', 'Aa'], ['geely', '几何设计体', 'Geely Design', '字'], ['xiangcui', '香萃集雪松', 'Xiangcui', '文']];
const modes = [['auto', '自动', 'fas fa-desktop'], ['light', '浅色', 'far fa-sun'], ['dark', '深色', 'far fa-moon']];
const Icon = ({ name }) => <i className={name} aria-hidden="true" />;
function Heading({ icon, title, subtitle }) {
  return <div className="mistlane-setting-heading"><span className="mistlane-setting-icon"><Icon name={icon} /></span><div><strong>{title}</strong><small>{subtitle}</small></div></div>;
}

export default function Appearance() {
  const [state, setState] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const update = (patch) => setState(previous => ({ ...previous, ...patch }));
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      setState({
        font: fonts.some(([value]) => value === saved.font) ? saved.font : 'system',
        colorMode: modes.some(([value]) => value === saved.colorMode) ? saved.colorMode : 'auto',
        fontSize: [90, 95, 100, 105, 110, 115].includes(saved.fontSize) ? saved.fontSize : 100,
        reduceMotion: saved.reduceMotion === true,
      });
    } catch { /* Storage can be unavailable in private browsing. */ }
    setReady(true);
    const click = event => {
      if (event.target.closest('#mistlane-settings-toggle')) setOpen(value => !value);
    };
    const close = () => setOpen(false);
    document.addEventListener('click', click);
    document.addEventListener('pjax:send', close);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('pjax:send', close);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const root = document.documentElement;
      root.dataset.siteFont = state.font;
      root.dataset.reduceMotion = String(state.reduceMotion);
      root.style.fontSize = `${state.fontSize}%`;
      root.dataset.theme = state.colorMode === 'dark' || (state.colorMode === 'auto' && media.matches) ? 'dark' : 'light';
      try { localStorage.setItem(key, JSON.stringify(state)); localStorage.setItem('theme', root.dataset.theme); } catch {}
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [state, ready]);
  useEffect(() => {
    const toggle = document.getElementById('mistlane-settings-toggle');
    document.documentElement.classList.toggle('mistlane-settings-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) panel.current?.querySelector('button')?.focus({ preventScroll: true });
    else if (panel.current?.contains(document.activeElement)) toggle?.focus({ preventScroll: true });
    const keydown = event => {
      if (!open) return;
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const items = [...panel.current.querySelectorAll('button, input')].filter(item => !item.disabled);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [open]);
  return <>
    <button id="mistlane-settings-backdrop" type="button" tabIndex={-1} aria-label="关闭外观设置" data-close-settings="" onClick={() => setOpen(false)} />
    <aside ref={panel} id="mistlane-settings-panel" className={`mistlane-control-panel${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open} aria-labelledby="mistlane-settings-title">
      <header className="mistlane-panel-header"><div className="mistlane-panel-title"><span className="mistlane-panel-mark"><Icon name="fas fa-wand-magic-sparkles" /></span><div><span className="mistlane-panel-eyebrow">PERSONALIZE</span><h2 id="mistlane-settings-title">外观设置</h2></div></div><button className="mistlane-panel-close" type="button" data-close-settings="" aria-label="关闭外观设置" title="关闭" onClick={() => setOpen(false)}><Icon name="fas fa-xmark" /></button></header>
      <div className="mistlane-appearance-summary" aria-live="polite"><div className="mistlane-summary-orbit"><span><Icon name="fas fa-font" /></span></div><div><small>当前外观</small><strong id="mistlane-appearance-summary">{fonts.find(([value]) => value === state.font)[1]} · {modes.find(([value]) => value === state.colorMode)[1]}模式 · {state.fontSize}%</strong></div><Icon name="fas fa-check" /></div>
      <div className="mistlane-panel-scroll">
        <section className="mistlane-setting-section"><Heading icon="fas fa-font" title="页面字体" subtitle="TYPOGRAPHY" /><div className="mistlane-font-options" role="radiogroup" aria-label="页面字体">{fonts.map(([value, label, english, preview]) => <button key={value} type="button" data-font={value} role="radio" aria-checked={state.font === value} onClick={() => update({ font: value })}><span className={`font-option-preview font-${value}`}>{preview}</span><span><strong>{label}</strong><small>{english}</small></span><Icon name="fas fa-check" /></button>)}</div></section>
        <section className="mistlane-setting-section"><Heading icon="fas fa-circle-half-stroke" title="颜色模式" subtitle="APPEARANCE" /><div className="mistlane-segmented" role="radiogroup" aria-label="颜色模式">{modes.map(([value, label, icon]) => <button key={value} type="button" data-color-mode={value} role="radio" aria-checked={state.colorMode === value} onClick={() => update({ colorMode: value })}><Icon name={icon} /><span>{label}</span></button>)}</div></section>
        <section className="mistlane-setting-section"><Heading icon="fas fa-text-height" title="阅读字号" subtitle="TEXT SIZE" /><div className="mistlane-range-control"><label className="mistlane-range-label" htmlFor="mistlane-font-size-range"><span>全站字体大小</span><output id="mistlane-font-size-output">{state.fontSize}%</output></label><input id="mistlane-font-size-range" type="range" min="90" max="115" step="5" value={state.fontSize} onChange={event => update({ fontSize: Number(event.target.value) })} /><div className="mistlane-range-scale" aria-hidden="true"><span>紧凑</span><span>舒展</span></div></div><div className="mistlane-setting-row"><span className="mistlane-row-icon"><Icon name="fas fa-feather" /></span><div><strong>减少动态效果</strong><small>静态浏览</small></div><label className="mistlane-switch"><input id="mistlane-motion-toggle" aria-label="减少动态效果" type="checkbox" checked={state.reduceMotion} onChange={event => update({ reduceMotion: event.target.checked })} /><span /></label></div></section>
      </div>
      <footer className="mistlane-panel-footer"><button id="mistlane-settings-reset" className="mistlane-reset-button" type="button" onClick={() => setState({ ...defaults })}><Icon name="fas fa-rotate-left" /><span>恢复默认</span></button><span>设置自动保存</span></footer>
    </aside>
  </>;
}
