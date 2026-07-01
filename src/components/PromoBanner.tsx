'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props { end?: string; title?: string }

export function PromoBanner({ end, title }: Props) {
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

  const box = (val: number, label: string) => (
    <div style={{ textAlign: 'center' }}>
      <span style={{ display: 'inline-block', minWidth: 36, background: 'rgba(255,255,255,.22)', borderRadius: 8, padding: '4px 6px', color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '1rem', lineHeight: 1.1 }}>{String(val).padStart(2, '0')}</span>
      <span style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.85)', display: 'block', marginTop: 3 }}>{label}</span>
    </div>
  )

  return (
    <Link href="/sale" style={{ textDecoration: 'none', display: 'block' }}>
      <div className="gradient-flow" style={{ background: 'linear-gradient(135deg,#FA87A1 0%,#e06080 50%,#c84060 100%)', padding: '11px 16px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem' }}>🏷 {title || 'Акция! Успейте'}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {box(d, 'дней')}{box(h, 'часов')}{box(m, 'минут')}{box(s, 'секунд')}
          </div>
        </div>
      </div>
    </Link>
  )
}
