'use client'
import { useState, useEffect } from 'react'

export function SaleCountdown({ end }: { end?: string | null }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!end || now === null) return null
  const target = new Date(end).getTime()
  if (isNaN(target)) return null
  const diff = target - now
  if (diff <= 0) return null

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const box = (v: number, l: string) => (
    <div style={{ textAlign: 'center' }}>
      <span style={{ display: 'inline-block', minWidth: 38, background: 'linear-gradient(135deg,#FA87A1,#e06080)', color: '#fff', borderRadius: 8, padding: '6px 6px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '1.05rem', lineHeight: 1.1 }}>{String(v).padStart(2, '0')}</span>
      <span style={{ fontSize: '.62rem', color: 'var(--text-sub)', display: 'block', marginTop: 3 }}>{l}</span>
    </div>
  )

  return (
    <div style={{ marginBottom: 22, padding: '13px 16px', background: 'var(--pink-mist)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ fontSize: '.82rem', color: 'var(--pink-dark)', fontWeight: 700, marginBottom: 10 }}>🏷 До конца акции осталось:</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {box(d, 'дней')}{box(h, 'часов')}{box(m, 'минут')}{box(s, 'секунд')}
      </div>
    </div>
  )
}
