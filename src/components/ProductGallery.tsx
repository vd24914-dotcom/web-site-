'use client'
import { useState } from 'react'

interface Props {
  images: string[]
  emoji?: string
  name: string
}

export function ProductGallery({ images, emoji, name }: Props) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('center')

  const hasImages = images.length > 0
  const current = images[active]

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div>
      {/* Главное фото с увеличением при наведении */}
      <div
        onMouseEnter={() => hasImages && setZoom(true)}
        onMouseLeave={() => { setZoom(false); setOrigin('center') }}
        onMouseMove={onMove}
        style={{
          aspectRatio: '1',
          background: hasImages ? 'transparent' : 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))',
          borderRadius: 22,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 108,
          marginBottom: 14,
          boxShadow: '0 12px 40px rgba(250,135,161,.15)',
          cursor: hasImages ? 'zoom-in' : 'default',
        }}
      >
        {hasImages ? (
          <img
            src={current}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform .15s ease-out',
              transform: zoom ? 'scale(2.3)' : 'scale(1)',
              transformOrigin: origin,
            }}
          />
        ) : (
          emoji || '🧶'
        )}
      </div>

      {/* Миниатюры — клик переключает ракурс */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              style={{
                width: 80,
                height: 80,
                flexShrink: 0,
                padding: 0,
                border: i === active ? '2px solid var(--pink)' : '2px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'none',
                opacity: i === active ? 1 : 0.65,
                transition: 'all .15s',
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
