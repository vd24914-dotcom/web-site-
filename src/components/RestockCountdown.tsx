'use client'
import { useState, useEffect } from 'react'
import { useT } from '@/components/SiteText'
import { SiteIcon } from '@/components/SiteIcon'

interface Props { at?: string | null; qty?: number | null; mini?: boolean }

export function RestockCountdown({ at, qty, mini }: Props) {
  const t = useT()
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
      return <span className="ok-text" style={{ fontSize: '.78rem', fontWeight: 700 }}>{t('card_in_stock')}{qty != null ? ` (${qty})` : ''}</span>
    }
    const txt = d > 0 ? `${d}д ${String(h).padStart(2, '0')}ч` : `${String(h).padStart(2, '0')}ч ${String(m).padStart(2, '0')}м`
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.72rem', fontWeight: 700, color: 'var(--pink-dark)', background: 'var(--pink-mist)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 20 }}>
        {t('timer_restock_soon')}: {txt}
      </span>
    )
  }

  // ── Полный вид (страница товара) ──
  if (available) {
    return (
      <div className="ok-box" style={{ marginBottom: 22, padding: '13px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="ok-text" style={{ display: 'inline-flex' }}><SiteIcon k="icon_back_in_stock" size={22} /></span>
        <span className="ok-text" style={{ fontWeight: 700 }}>{t('timer_back_in_stock')}{qty != null ? ` — ${qty} шт` : ''}</span>
      </div>
    )
  }

  const box = (v: number, l: string) => (
    <div style={{ textAlign: 'center' }}>
      <span style={{ display: 'inline-block', minWidth: 38, background: 'var(--text)', color: 'var(--white)', borderRadius: 8, padding: '6px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '1.05rem', lineHeight: 1.1 }}>{String(v).padStart(2, '0')}</span>
      <span style={{ fontSize: '.62rem', color: 'var(--text-sub)', display: 'block', marginTop: 3 }}>{l}</span>
    </div>
  )
  return (
    <div style={{ marginBottom: 22, padding: '13px 16px', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ fontSize: '.82rem', color: 'var(--text)', fontWeight: 700, marginBottom: 10 }}>{t('timer_restock_title')}{qty != null ? ` (поступит ${qty} шт)` : ''}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {box(d, t('timer_days'))}{box(h, t('timer_hours'))}{box(m, t('timer_minutes'))}{box(s, t('timer_seconds'))}
      </div>
    </div>
  )
}
