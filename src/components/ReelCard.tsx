'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'
import { InstagramIcon } from '@/components/SocialLinks'
import { reelEmbedUrl, reelUrl } from '@/lib/reels'

interface Props {
  id: string
  cover?: string
  index: number
}

/**
 * Карточка рилса: обложка с кнопкой «play», по клику на её месте
 * загружается встроенный плеер Instagram.
 */
export function ReelCard({ id, cover, index }: Props) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="reels-card">
      {playing ? (
        <iframe
          src={reelEmbedUrl(id)}
          title={`Instagram Reel ${index + 1}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
          frameBorder={0}
        />
      ) : (
        <button type="button" className="reels-cover" onClick={() => setPlaying(true)} aria-label="Воспроизвести">
          {cover
            ? <img src={cover} alt="" loading="lazy" decoding="async" />
            : <div className="reels-cover-empty"><InstagramIcon size={54} /></div>}
          <span className="reels-play"><Play size={26} fill="currentColor" /></span>
          <span className="reels-hint"><InstagramIcon size={13} /> Reels</span>
        </button>
      )}
      <a href={reelUrl(id)} target="_blank" rel="noopener noreferrer" className="reels-open" aria-label="Открыть в Instagram">
        <InstagramIcon size={14} /> Открыть
      </a>
    </div>
  )
}
