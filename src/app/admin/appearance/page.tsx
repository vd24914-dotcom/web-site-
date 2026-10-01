'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Save, RotateCcw, ExternalLink, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Check, Undo2, Upload } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'
import { ICON_DEFAULTS } from '@/components/SiteIcon'
import { resizeImageToBlob } from '@/lib/image'
import { CONTENT, DEFAULTS, type ContentField } from '@/lib/content'
import { parseHeroNav, serializeHeroNav, type HeroNavItem } from '@/lib/hero'
import { parseReelId, parseReels, serializeReels, reelUrl, type Reel } from '@/lib/reels'

/**
 * «Контент сайта»: все тексты и картинки сайта.
 * Разделы и поля берутся из реестра src/lib/content.ts, поэтому новый текст на сайте
 * достаточно добавить туда — он сам появится здесь. Пустое поле = стандартный текст.
 */
export default function ContentPage() {
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [cats, setCats] = useState<any[]>([])
  const [savedCats, setSavedCats] = useState<any[]>([])
  const setCat = (id: number, patch: Record<string, string>) => setCats(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  const changedCats = cats.filter(c => { const o = savedCats.find(x => x.id === c.id); return o && (o.name !== c.name || (o.icon || '') !== (c.icon || '') || o.emoji !== c.emoji) })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [active, setActive] = useState<string>(CONTENT[0].id)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => { setSaved(d.settings || {}); setValues(d.settings || {}) }).catch(() => {}).finally(() => setLoading(false))
    fetch('/api/admin/categories').then(r => r.json()).then(d => { setCats(d.categories || []); setSavedCats(d.categories || []) }).catch(() => {})
  }, [])

  const set = (key: string, v: string) => setValues(prev => ({ ...prev, [key]: v }))
  const changedKeys = useMemo(() => {
    const keys = new Set([...Object.keys(values), ...Object.keys(saved)])
    return [...keys].filter(k => (values[k] || '') !== (saved[k] || ''))
  }, [values, saved])
  const dirty = changedKeys.length > 0 || changedCats.length > 0

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const save = async () => {
    setSaving(true)
    const payload: Record<string, string> = {}
    for (const k of changedKeys) payload[k] = values[k] || ''
    const ok = (r: Response | null) => !!r && r.ok
    if (changedKeys.length) {
      const r = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: payload }) }).catch(() => null)
      if (!ok(r)) { setSaving(false); alert('Не сохранилось. Проверьте интернет и попробуйте ещё раз'); return }
    }
    for (const c of changedCats) {
      const r = await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, name: c.name, emoji: c.emoji, icon: c.icon || '', sortOrder: c.sortOrder }) }).catch(() => null)
      if (!ok(r)) { setSaving(false); setSaved({ ...values }); alert(`Категория «${c.name}» не сохранилась. Название не может быть пустым`); return }
    }
    setSaved({ ...values }); setSavedCats(cats)
    setSaving(false); setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2200)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (dirty && !saving) save() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const q = query.trim().toLowerCase()
  const matches = (f: ContentField) => !q || [f.label, f.section, f.hint, f.def, values[f.key]].some(x => (x || '').toLowerCase().includes(q))
  const groups = q ? CONTENT.map(g => ({ ...g, fields: g.fields.filter(matches) })).filter(g => g.fields.length) : CONTENT.filter(g => g.id === active)
  const customized = (g: typeof CONTENT[number]) => g.fields.filter(f => saved[f.key]).length

  if (loading) return <div className="ad-loading"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Контент сайта</h1>
          <p>Все тексты и картинки. Пустое поле — показывается стандартный текст (он виден серым).</p>
        </div>
        <div className="ad-head-actions">
          <a href="/" target="_blank" className="ad-btn ghost"><ExternalLink size={16} /> Открыть сайт</a>
        </div>
      </header>

      <div className="ad-search">
        <Search size={17} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти текст на сайте: например «доставка» или «Заказать»" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Очистить">×</button>}
      </div>

      <div className="ad-content">
        {!q && (
          <nav className="ad-groups" aria-label="Разделы">
            {CONTENT.map(g => (
              <button key={g.id} type="button" className={active === g.id ? 'on' : ''} onClick={() => setActive(g.id)}>
                <span>{g.title}</span>
                {customized(g) > 0 && <em>{customized(g)}</em>}
              </button>
            ))}
          </nav>
        )}

        <div className="ad-main">
          {q && groups.length === 0 && <div className="ad-empty">Ничего не нашлось по «{query}»</div>}

          {groups.map(g => (
            <section key={g.id} className="ad-card">
              <div className="ad-card-head">
                <h2>{g.title}</h2>
                {g.description && <p>{g.description}</p>}
              </div>
              {chunks(g.fields).map((c, ci) => {
                const fields = <div className="ad-fields">{c.fields.map(f => <Field key={f.key} f={f} value={values[f.key] || ''} saved={saved[f.key] || ''} onChange={v => set(f.key, v)} />)}</div>
                return c.section
                  ? <div key={ci} className="ad-sec"><div className="ad-sec-title">{c.section}</div>{fields}</div>
                  : <div key={ci}>{fields}</div>
              })}
              {g.id === 'hero' && <HeroExtra values={values} set={set} cats={cats} setCat={setCat} />}
              {g.id === 'reels' && <ReelsEditor values={values} set={set} />}
            </section>
          ))}
        </div>
      </div>

      <div className={`ad-savebar${dirty || justSaved ? ' show' : ''}`}>
        <span>{justSaved ? <><Check size={16} /> Сохранено, сайт обновится через пару секунд</> : `Несохранённых изменений: ${changedKeys.length + changedCats.length}`}</span>
        {dirty && <button type="button" className="ad-btn ghost" onClick={() => { setValues({ ...saved }); setCats(savedCats) }}><Undo2 size={16} /> Отменить</button>}
        {dirty && <button type="button" className="ad-btn primary" onClick={save} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить</button>}
      </div>
    </div>
  )
}

/** Поля подряд с одинаковым section — один подблок */
function chunks(fields: ContentField[]) {
  const out: { section?: string; fields: ContentField[] }[] = []
  for (const f of fields) {
    const last = out[out.length - 1]
    if (last && last.section === f.section) last.fields.push(f)
    else out.push({ section: f.section, fields: [f] })
  }
  return out
}

/** Иконка: превью (своя картинка или стандартная иконка), загрузка и возврат к стандартной */
function IconField({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  const D = ICON_DEFAULTS[k]
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const upload = async (file: File) => {
    setBusy(true); setError('')
    try {
      if (!file.type.startsWith('image/')) throw new Error('Это не изображение')
      const fd = new FormData()
      // SVG загружаем как есть, остальное — сжимаем
      if (file.type === 'image/svg+xml') fd.append('file', file, file.name)
      else fd.append('file', await resizeImageToBlob(file), 'icon.webp')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      onChange(data.url)
    } catch (e: any) { setError(e.message || 'Ошибка загрузки') }
    setBusy(false)
  }
  return (
    <div className="ad-icon-field">
      <div className={`ad-icon-prev${value ? ' custom' : ''}`}>
        {busy ? <Loader2 size={22} className="animate-spin" /> : value ? <img src={value} alt="" /> : D ? <D size={26} /> : null}
      </div>
      <div className="ad-icon-side">
        <span className="ad-icon-state">{value ? 'Своя картинка' : 'Стандартная иконка'}</span>
        <div className="ad-icon-btns">
          <button type="button" className="ad-btn ghost sm" onClick={() => input.current?.click()} disabled={busy}><Upload size={14} /> {value ? 'Заменить' : 'Загрузить свою'}</button>
          {value && <button type="button" className="ad-reset" onClick={() => onChange('')}><RotateCcw size={12} /> стандартная</button>}
        </div>
        {error && <small className="ad-hint err">{error}</small>}
      </div>
      <input ref={input} type="file" hidden accept="image/png,image/webp,image/svg+xml,image/jpeg,image/gif" onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = '' }} />
    </div>
  )
}

function Field({ f, value, saved, onChange }: { f: ContentField; value: string; saved: string; onChange: (v: string) => void }) {
  const type = f.type || 'text'
  const def = DEFAULTS[f.key] ?? ''
  const changed = value !== saved
  const wide = type === 'textarea' || type === 'image'
  return (
    <div className={`ad-field${wide ? ' wide' : ''}${changed ? ' changed' : ''}`}>
      <div className="ad-label">
        <label htmlFor={`f-${f.key}`}>{f.label}</label>
        {value && type !== 'toggle' && type !== 'image' && type !== 'icon' && (
          <button type="button" className="ad-reset" onClick={() => onChange('')} title="Вернуть стандартный текст"><RotateCcw size={12} /> по умолчанию</button>
        )}
      </div>
      {type === 'textarea' && <textarea id={`f-${f.key}`} className="ad-input" rows={3} placeholder={def} value={value} onChange={e => onChange(e.target.value)} />}
      {(type === 'text' || type === 'url' || type === 'emoji') && <input id={`f-${f.key}`} className={`ad-input${type === 'emoji' ? ' emoji' : ''}`} placeholder={def} value={value} onChange={e => onChange(e.target.value)} />}
      {type === 'datetime' && <input id={`f-${f.key}`} type="datetime-local" className="ad-input" value={value} onChange={e => onChange(e.target.value)} />}
      {type === 'toggle' && (
        <label className="ad-switch">
          <input type="checkbox" checked={(value || def) !== '0'} onChange={e => onChange(e.target.checked ? '1' : '0')} />
          <span /> {(value || def) !== '0' ? 'Включено' : 'Выключено'}
        </label>
      )}
      {type === 'image' && <ImageUploader value={value} onChange={onChange} hint={f.hint} />}
      {type === 'icon' && <IconField k={f.key} value={value} onChange={onChange} />}
      {f.hint && type !== 'image' && <small className="ad-hint">{f.hint}</small>}
    </div>
  )
}

function HeroExtra({ values, set, cats, setCat }: { values: Record<string, string>; set: (k: string, v: string) => void; cats: any[]; setCat: (id: number, patch: Record<string, string>) => void }) {
  const nav = parseHeroNav(values.hero_nav)
  const setNav = (list: HeroNavItem[]) => set('hero_nav', serializeHeroNav(list))
  const slugs = (values.hero_categories || '').split(',').map(x => x.trim()).filter(Boolean)
  const toggle = (slug: string) => set('hero_categories', (slugs.includes(slug) ? slugs.filter(x => x !== slug) : [...slugs, slug]).join(','))
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= nav.length) return; const n = [...nav]; [n[i], n[j]] = [n[j], n[i]]; setNav(n) }
  return (
    <>
      <div className="ad-sub">
        <div className="ad-card-head"><h3>Меню первого экрана</h3><p>Ссылка — страница (/catalog, /sale, /news) или якорь на главной (/#about, /#contact)</p></div>
        <div className="ad-list">
          {nav.map((item, i) => (
            <div key={i} className="ad-row">
              <input className="ad-input" placeholder="Название" value={item.name} onChange={e => setNav(nav.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <input className="ad-input" placeholder="/catalog" value={item.href} onChange={e => setNav(nav.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
              <div className="ad-row-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Выше"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === nav.length - 1} aria-label="Ниже"><ArrowDown size={15} /></button>
                <button type="button" className="danger" onClick={() => setNav(nav.filter((_, j) => j !== i))} aria-label="Удалить"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          <button type="button" className="ad-add" onClick={() => setNav([...nav, { name: '', href: '/' }])}><Plus size={15} /> Добавить пункт</button>
        </div>
      </div>
      <div className="ad-sub">
        <div className="ad-card-head"><h3>Карточки категорий</h3><p>Отметьте, какие показывать под заголовком (лучше 4, до 8), порядок — как отмечали. Название и картинку карточки меняйте прямо здесь</p></div>
        {cats.length === 0 ? <div className="ad-empty">Категорий пока нет</div> : (
          <div className="ad-cats">
            {cats.map((c: any) => {
              const idx = slugs.indexOf(c.slug)
              return (
                <div key={c.id} className={`ad-cat${idx >= 0 ? ' on' : ''}`}>
                  <label className="ad-cat-top">
                    <input type="checkbox" checked={idx >= 0} onChange={() => toggle(c.slug)} />
                    <span>{idx >= 0 ? `На главной · ${idx + 1}` : 'Не показывается'}</span>
                  </label>
                  <ImageUploader value={c.icon || ''} onChange={url => setCat(c.id, { icon: url })} hint="PNG с прозрачным фоном" />
                  <div className="ad-cat-fields">
                    <input className="ad-input" value={c.name} onChange={e => setCat(c.id, { name: e.target.value })} placeholder="Название" />
                    <input className="ad-input emoji" value={c.emoji || ''} onChange={e => setCat(c.id, { emoji: e.target.value })} title="Эмодзи, если нет картинки" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function ReelsEditor({ values, set }: { values: Record<string, string>; set: (k: string, v: string) => void }) {
  const reels = parseReels(values.reels)
  const setReels = (list: Reel[]) => set('reels', serializeReels(list))
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const add = () => {
    const id = parseReelId(input)
    if (!id) { setError('Не похоже на ссылку на рилс. Пример: https://www.instagram.com/reel/C1a2B3c4D5e/'); return }
    if (reels.some(r => r.id === id)) { setError('Этот рилс уже добавлен'); return }
    setReels([...reels, { id }]); setInput(''); setError('')
  }
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= reels.length) return; const n = [...reels]; [n[i], n[j]] = [n[j], n[i]]; setReels(n) }
  const on = values.reels_enabled === '1'
  return (
    <div className="ad-sub">
      <div className="ad-card-head"><h3>Видео</h3><p>В Instagram: «Поделиться» → «Копировать ссылку». К каждому рилсу загрузите обложку 9:16</p></div>
      <label className="ad-switch big">
        <input type="checkbox" checked={on} onChange={e => set('reels_enabled', e.target.checked ? '1' : '')} />
        <span /> {on ? 'Блок показывается на сайте' : 'Блок скрыт'}
      </label>
      <div className="ad-row" style={{ gridTemplateColumns: '1fr auto', marginTop: 16 }}>
        <input className="ad-input" placeholder="https://www.instagram.com/reel/..." value={input} onChange={e => { setInput(e.target.value); setError('') }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <button type="button" className="ad-btn primary" onClick={add}><Plus size={16} /> Добавить</button>
      </div>
      {error && <small className="ad-hint err">{error}</small>}
      <div className="ad-reels">
        {reels.length === 0 && <div className="ad-empty">Пока нет ни одного рилса</div>}
        {reels.map((r, i) => (
          <div key={r.id} className="ad-reel">
            <div className="ad-reel-cover">{r.cover ? <img src={r.cover} alt="" /> : <span>нет обложки</span>}</div>
            <div className="ad-reel-main">
              <div className="ad-reel-top">
                <a href={reelUrl(r.id)} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> reel/{r.id}</a>
                <div className="ad-row-tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Выше"><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === reels.length - 1} aria-label="Ниже"><ArrowDown size={15} /></button>
                  <button type="button" className="danger" onClick={() => setReels(reels.filter((_, j) => j !== i))} aria-label="Удалить"><Trash2 size={15} /></button>
                </div>
              </div>
              <ImageUploader value={r.cover} onChange={url => setReels(reels.map((x, j) => j === i ? { ...x, cover: url || undefined } : x))} hint="Вертикальный кадр 9:16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
