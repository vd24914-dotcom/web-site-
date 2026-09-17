'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'

interface Props {
  title?: string
  onClose: () => void
}

/**
 * Уведомление на полэкрана: «раздел временно недоступен».
 * Показывается по клику на выключенный раздел (например, «Мастер-классы»).
 */
export function UnavailableNotice({ title = 'Мастер-классы', onClose }: Props) {
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
    <div className="un-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${title}: временно недоступно`}>
      <div className="un-sheet gradient-flow" onClick={e => e.stopPropagation()}>
        <button type="button" className="un-close" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        <div className="un-art animate-float">🧶</div>
        <span className="badge badge-rose" style={{ marginBottom: 14 }}>🎓 {title}</span>
        <h2 className="font-display un-title">Раздел временно недоступен</h2>
        <p className="un-text">Мы готовим первые уроки — совсем скоро здесь появятся пошаговые видео по вязанию. А пока загляните в каталог или следите за новостями.</p>
        <div className="un-actions">
          <Link href="/catalog" className="btn-primary" onClick={onClose}>Смотреть каталог <ArrowRight size={16} /></Link>
          <button type="button" className="btn-outline" onClick={onClose}>Понятно</button>
        </div>
      </div>
      <style>{`
        .un-overlay{position:fixed;inset:0;z-index:9999;background:rgba(20,8,14,.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:unFade .2s ease}
        .un-sheet{position:relative;width:min(600px,100%);min-height:50vh;border-radius:28px;padding:44px 36px 36px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(150deg,var(--cream) 0%,var(--pink-mist) 50%,var(--pink-light) 100%);border:1px solid var(--border);box-shadow:0 40px 100px rgba(0,0,0,.35);animation:unPop .35s cubic-bezier(.2,.8,.2,1)}
        .un-close{position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;background:var(--white);color:var(--text-sub);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.1);transition:background .2s,color .2s}
        .un-close:hover{background:var(--pink);color:#fff}
        .un-art{width:104px;height:104px;margin:0 auto 20px;border-radius:60% 40% 50% 50% / 50% 50% 40% 60%;background:var(--white);display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 18px 44px rgba(250,135,161,.28);border:1px solid var(--border)}
        .un-title{font-size:clamp(1.5rem,3.5vw,2rem);color:var(--text);margin:0 0 12px;line-height:1.2}
        .un-text{color:var(--text-sub);line-height:1.7;max-width:440px;margin:0 auto 26px;font-size:.98rem}
        .un-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        @keyframes unFade{from{opacity:0}to{opacity:1}}
        @keyframes unPop{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:none}}
        @media(max-width:640px){.un-overlay{padding:0;align-items:flex-end}.un-sheet{width:100%;min-height:55vh;border-radius:28px 28px 0 0;padding:40px 22px 30px;animation:unSlide .35s cubic-bezier(.2,.8,.2,1)}}
        @keyframes unSlide{from{transform:translateY(100%)}to{transform:none}}
      `}</style>
    </div>,
    document.body
  )
}
