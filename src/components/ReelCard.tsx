'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Play, X } from 'lucide-react'
import { InstagramIcon } from '@/components/SocialLinks'
import { reelEmbedUrl, reelUrl } from '@/lib/reels'

interface Props {
  id: string
  cover?: string
  index: number
}

/**
 * Карточка рилса: обложка с кнопкой «play».
 * По клику открывается модальное окно с встроенным плеером Instagram.
 */
export function ReelCard({ id, cover, index }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="reels-card">
        <button type="button" className="reels-cover" onClick={() => setOpen(true)} aria-label="Воспроизвести">
          {cover
            ? <img src={cover} alt="" loading="lazy" decoding="async" />
            : <div className="reels-cover-empty"><InstagramIcon size={54} /></div>}
          <span className="reels-play"><Play size={26} fill="currentColor" /></span>
          <span className="reels-hint"><InstagramIcon size={13} /> Reels</span>
        </button>
        <a href={reelUrl(id)} target="_blank" rel="noopener noreferrer" className="reels-open" aria-label="Открыть в Instagram">
          <InstagramIcon size={14} /> Открыть
        </a>
      </div>
      {open && <ReelModal id={id} index={index} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReelModal({ id, index, onClose }: { id: string; index: number; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div className="reel-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="Instagram Reel">
      <div className="reel-modal-box" onClick={e => e.stopPropagation()}>
        <iframe
          src={reelEmbedUrl(id)}
          title={`Instagram Reel ${index + 1}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
          frameBorder={0}
        />
        <button type="button" className="reel-modal-close" onClick={onClose} aria-label="Закрыть">
          <X size={22} />
        </button>
        <a href={reelUrl(id)} target="_blank" rel="noopener noreferrer" className="reel-modal-link">
          <InstagramIcon size={14} /> Открыть в Instagram
        </a>
      </div>
      <style>{`
        .reel-modal{position:fixed;inset:0;z-index:9999;background:rgba(20,8,14,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;animation:reelFade .2s ease}
        .reel-modal-box{position:relative;width:min(400px,100%);height:min(720px,calc(100vh - 32px));border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.5);animation:reelPop .25s ease}
        .reel-modal-box iframe{width:100%;height:100%;border:0;display:block;background:#fff}
        .reel-modal-close{position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:0;cursor:pointer;background:rgba(255,255,255,.92);color:var(--pink-deep,#c84060);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.2);transition:background .2s,color .2s}
        .reel-modal-close:hover{background:var(--pink,#FA87A1);color:#fff}
        .reel-modal-link{position:absolute;left:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.92);color:var(--pink-deep,#c84060);font-size:.78rem;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.15)}
        .reel-modal-link:hover{background:var(--pink,#FA87A1);color:#fff}
        @keyframes reelFade{from{opacity:0}to{opacity:1}}
        @keyframes reelPop{from{opacity:0;transform:scale(.94) translateY(10px)}to{opacity:1;transform:none}}
        @media(max-width:480px){.reel-modal{padding:0}.reel-modal-box{width:100%;height:100%;border-radius:0}}
      `}</style>
    </div>,
    document.body
  )
}
