'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Item {
  id: number; slug: string; name: string; price: number; onSale: boolean; salePrice?: number | null
  image: string | null; category: string; emoji: string
}

/** Кнопка поиска в шапке + всплывающее окно с живыми подсказками */
export function SearchBox({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Поиск" className="search-btn"
        style={{ background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: 999, height: 36, padding: compact ? 0 : '0 14px 0 12px', width: compact ? 36 : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text)', fontSize: '.85rem', fontWeight: 500, transition: 'background .2s, color .2s' }}>
        <Search size={17} />
        {!compact && <span>Поиск</span>}
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
      <style>{`.search-btn:hover{background:var(--pink-light)!important;color:var(--pink-deep)!important}`}</style>
    </>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const reqId = useRef(0)

  useEffect(() => {
    setMounted(true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    setTimeout(() => inputRef.current?.focus(), 30)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  // Живой поиск с задержкой
  useEffect(() => {
    const query = q.trim()
    if (query.length < 2) { setItems([]); setTotal(0); setLoading(false); return }
    setLoading(true)
    const id = ++reqId.current
    const t = setTimeout(async () => {
      try {
        const d = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json())
        if (id !== reqId.current) return
        setItems(d.items || []); setTotal(d.total || 0); setActive(-1)
      } catch { /* сеть недоступна — просто ничего не показываем */ }
      if (id === reqId.current) setLoading(false)
    }, 220)
    return () => clearTimeout(t)
  }, [q])

  const goCatalog = useCallback(() => {
    const query = q.trim()
    if (!query) return
    onClose()
    router.push(`/catalog?q=${encodeURIComponent(query)}`)
  }, [q, onClose, router])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && items[active]) { onClose(); router.push(`/product/${items[active].slug}`) }
      else goCatalog()
    }
  }

  if (!mounted) return null
  const query = q.trim()

  return createPortal(
    <div className="srch-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Поиск по каталогу">
      <div className="srch-box" onClick={e => e.stopPropagation()}>
        <div className="srch-input-wrap">
          <Search size={20} style={{ color: 'var(--pink)', flexShrink: 0 }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Что ищете? Например: шапка, плед, зайка…" className="srch-input" autoComplete="off" spellCheck={false} />
          {loading ? <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-sub)' }} />
            : q ? <button type="button" onClick={() => { setQ(''); inputRef.current?.focus() }} className="srch-clear" aria-label="Очистить"><X size={16} /></button> : null}
          <button type="button" onClick={onClose} className="srch-close" aria-label="Закрыть"><X size={20} /></button>
        </div>

        <div className="srch-body">
          {query.length < 2 ? (
            <div className="srch-empty">
              <div style={{ fontSize: 40, marginBottom: 10 }}>🧶</div>
              <p>Начните вводить название изделия, цвет или категорию</p>
              <div className="srch-chips">
                {['шапка', 'свитер', 'плед', 'игрушка', 'носки', 'подарок'].map(w => (
                  <button key={w} type="button" className="srch-chip" onClick={() => setQ(w)}>{w}</button>
                ))}
              </div>
            </div>
          ) : items.length === 0 && !loading ? (
            <div className="srch-empty">
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p>По запросу «{query}» ничего не нашлось</p>
              <p style={{ fontSize: '.82rem', marginTop: 6 }}>Попробуйте другое слово или посмотрите весь каталог</p>
              <Link href="/catalog" onClick={onClose} className="btn-outline" style={{ marginTop: 16, fontSize: '.85rem' }}>Открыть каталог <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <>
              <ul className="srch-list">
                {items.map((it, i) => (
                  <li key={it.id}>
                    <Link href={`/product/${it.slug}`} onClick={onClose} className={`srch-item${i === active ? ' active' : ''}`} onMouseEnter={() => setActive(i)}>
                      <div className="srch-thumb">{it.image ? <img src={it.image} alt="" loading="lazy" /> : <span>{it.emoji}</span>}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="srch-name">{highlight(it.name, query)}</div>
                        <div className="srch-cat">{it.category}</div>
                      </div>
                      <div className="srch-price">
                        {it.onSale && it.salePrice
                          ? <><span style={{ color: 'var(--pink-deep)', fontWeight: 700 }}>{formatPrice(it.salePrice)}</span><s style={{ color: 'var(--text-sub)', fontSize: '.75rem', marginLeft: 6 }}>{formatPrice(it.price)}</s></>
                          : <span style={{ fontWeight: 700 }}>{formatPrice(it.price)}</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {total > items.length && (
                <button type="button" onClick={goCatalog} className="srch-more">Показать все {total} <ArrowRight size={14} /></button>
              )}
              {total <= items.length && total > 0 && (
                <button type="button" onClick={goCatalog} className="srch-more">Открыть в каталоге <ArrowRight size={14} /></button>
              )}
            </>
          )}
        </div>
        <div className="srch-foot"><kbd>↑</kbd><kbd>↓</kbd> выбрать · <kbd>Enter</kbd> открыть · <kbd>Esc</kbd> закрыть</div>
      </div>
      <style>{`
        .srch-overlay{position:fixed;inset:0;z-index:9999;background:rgba(20,8,14,.55);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 16px;animation:srchFade .18s ease}
        .srch-box{width:min(680px,100%);background:var(--white);border:1px solid var(--border);border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.35);overflow:hidden;animation:srchPop .28s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;max-height:84vh}
        .srch-input-wrap{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--border)}
        .srch-input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:1.05rem;color:var(--text)}
        .srch-input::placeholder{color:var(--text-sub);opacity:.8}
        .srch-clear,.srch-close{border:0;background:var(--cream-dark);color:var(--text-sub);width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s,color .2s}
        .srch-clear:hover,.srch-close:hover{background:var(--pink);color:#fff}
        .srch-body{overflow-y:auto;padding:8px}
        .srch-empty{text-align:center;padding:36px 20px;color:var(--text-sub);font-size:.95rem}
        .srch-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px}
        .srch-chip{border:1px solid var(--border);background:var(--pink-mist);color:var(--pink-deep);border-radius:999px;padding:6px 14px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .2s,color .2s}
        .srch-chip:hover{background:var(--pink);color:#fff}
        .srch-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
        .srch-item{display:flex;align-items:center;gap:14px;padding:10px 12px;border-radius:14px;text-decoration:none;color:var(--text);transition:background .15s}
        .srch-item:hover,.srch-item.active{background:var(--pink-mist)}
        .srch-thumb{width:56px;height:56px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,var(--pink-light),var(--cream-dark));display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
        .srch-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .srch-name{font-weight:600;font-size:.95rem;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .srch-name mark{background:var(--pink-light);color:var(--pink-deep);border-radius:4px;padding:0 2px}
        .srch-cat{font-size:.75rem;color:var(--text-sub);margin-top:2px}
        .srch-price{font-size:.85rem;white-space:nowrap;color:var(--text)}
        .srch-more{width:100%;margin-top:6px;border:0;background:var(--cream);color:var(--pink-deep);font:inherit;font-weight:700;font-size:.88rem;padding:12px;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,color .2s}
        .srch-more:hover{background:var(--pink);color:#fff}
        .srch-foot{padding:10px 18px;border-top:1px solid var(--border);font-size:.72rem;color:var(--text-sub);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
        .srch-foot kbd{border:1px solid var(--border);border-radius:6px;padding:1px 6px;background:var(--cream);font-family:inherit;font-size:.7rem}
        @keyframes srchFade{from{opacity:0}to{opacity:1}}
        @keyframes srchPop{from{opacity:0;transform:translateY(-16px) scale(.98)}to{opacity:1;transform:none}}
        @media(max-width:640px){.srch-overlay{padding:0}.srch-box{border-radius:0;max-height:100vh;height:100%}.srch-foot{display:none}.srch-price s{display:none}}
      `}</style>
    </div>,
    document.body
  )
}

/** Подсвечивает совпавшие слова в названии */
function highlight(text: string, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 1)
  if (!words.length) return text
  const pattern = `(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`
  const parts = text.split(new RegExp(pattern, 'ig'))
  const isMatch = new RegExp(`^${pattern}$`, 'i')
  return parts.map((part, i) => isMatch.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>)
}
