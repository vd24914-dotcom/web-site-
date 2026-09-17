'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Play, X, Clock, Film } from 'lucide-react'
import { youtubeEmbedUrl, youtubeThumb } from '@/lib/video'

export interface MasterClassItem {
  id: number
  title: string
  description: string
  kind: string
  videoUrl: string
  cover?: string | null
  duration?: string | null
  createdAt: string | Date
}

/**
 * Карточка мастер-класса: обложка, кнопка «play», по клику — модальный плеер
 * (YouTube-iframe или загруженное видео).
 */
export function MasterClassCard({ item }: { item: MasterClassItem }) {
  const [open, setOpen] = useState(false)
  const isYT = item.kind === 'youtube'
  const cover = item.cover || (isYT ? youtubeThumb(item.videoUrl) : '')
  const date = new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <article className="mc-card">
        <button type="button" className="mc-cover" onClick={() => setOpen(true)} aria-label={`Смотреть: ${item.title}`}>
          {cover
            ? <img src={cover} alt="" loading="lazy" decoding="async" />
            : <video src={`${item.videoUrl}#t=0.5`} preload="metadata" muted playsInline aria-hidden="true" />}
          <span className={`mc-pill mc-pill-src ${isYT ? 'yt' : ''}`}>
            {isYT ? <><YouTubeIcon size={13} /> YouTube</> : <><Film size={13} /> Видео</>}
          </span>
          {item.duration && <span className="mc-pill mc-pill-dur"><Clock size={11} /> {item.duration}</span>}
          <span className="mc-play"><Play size={24} fill="currentColor" /></span>
        </button>
        <div className="mc-body">
          <h3 className="mc-title">{item.title}</h3>
          {item.description && <p className="mc-desc">{item.description}</p>}
          <div className="mc-meta">
            <span>{date}</span>
            <button type="button" onClick={() => setOpen(true)} className="mc-watch" style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}>
              Смотреть <Play size={12} fill="currentColor" />
            </button>
          </div>
        </div>
      </article>
      {open && <MasterClassModal item={item} onClose={() => setOpen(false)} />}
    </>
  )
}

function MasterClassModal({ item, onClose }: { item: MasterClassItem; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div className="mc-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="mc-modal-box" onClick={e => e.stopPropagation()}>
        <button type="button" className="mc-modal-close" onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        <div className="mc-modal-player">
          {item.kind === 'youtube'
            ? <iframe src={youtubeEmbedUrl(item.videoUrl)} title={item.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            : <video src={item.videoUrl} controls autoPlay playsInline poster={item.cover || undefined} />}
        </div>
        <div className="mc-modal-title">
          <span>{item.title}</span>
          {item.duration && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.8rem', opacity: .8 }}><Clock size={13} /> {item.duration}</span>}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function YouTubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
