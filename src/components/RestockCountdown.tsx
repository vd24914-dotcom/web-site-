'use client'
import { useState, useEffect } from 'react'

interface Props { at?: string | null; qty?: number | null; mini?: boolean }

export function RestockCountdown({ at, qty, mini }: Props) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!at || now === null) return null
  const target = new Date(at).getTime()
  if (isNaN(target)) return null
  const diff = target - now
  const available = diff <= 0

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  // ── Компактный вид (карточки) ──
  if (mini) {
    if (available) {
      return <span style={{ fontSize: '.78rem', color: '#2e7d45', fontWeight: 700 }}>✓ В наличии{qty != null ? ` (${qty})` : ''}</span>
    }
    const txt = d > 0 ? `${d}д ${String(h).padStart(2, '0')}ч` : `${String(h).padStart(2, '0')}ч ${String(m).padStart(2, '0')}м`
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.72rem', fontWeight: 700, color: 'var(--pink-dark)', background: 'var(--pink-mist)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 20 }}>
        ⏳ Скоро: {txt}
      </span>
    )
  }

  // ── Полный вид (страница товара) ──
  if (available) {
    return (
      <div style={{ marginBottom: 22, padding: '13px 16px', background: '#e8f5eb', border: '1px solid #b7e0c2', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>✅</span>
        <span style={{ color: '#2e7d45', fontWeight: 700 }}>Снова в наличии{qty != null ? ` — ${qty} шт` : ''}</span>
      </div>
    )
  }

  const box = (v: number, l: string) => (
    <div style={{ textAlign: 'center' }}>
      <span style={{ display: 'inline-block', minWidth: 38, background: 'var(--text)', color: '#fff', borderRadius: 8, padding: '6px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '1.05rem', lineHeight: 1.1 }}>{String(v).padStart(2, '0')}</span>
      <span style={{ fontSize: '.62rem', color: 'var(--text-sub)', display: 'block', marginTop: 3 }}>{l}</span>
    </div>
  )
  return (
    <div style={{ marginBottom: 22, padding: '13px 16px', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ fontSize: '.82rem', color: 'var(--text)', fontWeight: 700, marginBottom: 10 }}>⏳ Будет в наличии через:{qty != null ? ` (поступит ${qty} шт)` : ''}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {box(d, 'дней')}{box(h, 'часов')}{box(m, 'минут')}{box(s, 'секунд')}
      </div>
    </div>
  )
}
