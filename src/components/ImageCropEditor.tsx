'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Check, X, Loader2, ZoomIn } from 'lucide-react'

const FRAME = 300 // редактируемая область (квадрат), px
const OUT = 1000  // итоговое разрешение, px

interface Props {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export function ImageCropEditor({ file, onConfirm, onCancel }: Props) {
  const [src, setSrc] = useState('')
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const base = useRef(1)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    const im = new Image()
    im.onload = () => {
      base.current = Math.max(FRAME / im.naturalWidth, FRAME / im.naturalHeight)
      const eff = base.current
      setImg(im)
      setZoom(1)
      setOff({ x: (FRAME - im.naturalWidth * eff) / 2, y: (FRAME - im.naturalHeight * eff) / 2 })
    }
    im.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const eff = img ? base.current * zoom : 1
  const dispW = img ? img.naturalWidth * eff : 0
  const dispH = img ? img.naturalHeight * eff : 0

  const clamp = useCallback((o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(FRAME - dispW, o.x)),
    y: Math.min(0, Math.max(FRAME - dispH, o.y)),
  }), [dispW, dispH])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX - off.x, y: e.clientY - off.y }
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId) } catch {}
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setOff(clamp({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }))
  }
  const onUp = () => { drag.current = null }

  const onZoom = (z: number) => {
    if (!img) return
    const oldEff = base.current * zoom
    const newEff = base.current * z
    const cx = (FRAME / 2 - off.x) / oldEff
    const cy = (FRAME / 2 - off.y) / oldEff
    let nx = FRAME / 2 - cx * newEff
    let ny = FRAME / 2 - cy * newEff
    const w = img.naturalWidth * newEff
    const h = img.naturalHeight * newEff
    nx = Math.min(0, Math.max(FRAME - w, nx))
    ny = Math.min(0, Math.max(FRAME - h, ny))
    setZoom(z); setOff({ x: nx, y: ny })
  }

  const apply = async () => {
    if (!img) return
    setBusy(true)
    const cropX = -off.x / eff
    const cropY = -off.y / eff
    const cropSide = FRAME / eff
    const canvas = document.createElement('canvas')
    canvas.width = OUT; canvas.height = OUT
    const ctx = canvas.getContext('2d')
    if (!ctx) { setBusy(false); return }
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, OUT, OUT)
    ctx.drawImage(img, cropX, cropY, cropSide, cropSide, 0, 0, OUT, OUT)
    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b as Blob), 'image/webp', 0.85))
    onConfirm(blob)
  }

  const PV = 190
  const k = PV / FRAME

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(74,45,58,.45)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{ background: 'var(--white)', borderRadius: 18, padding: 22, maxWidth: 680, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Кадрируйте фото</h3>
          <button onClick={onCancel} style={{ background: 'var(--cream-dark)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="var(--text-sub)" /></button>
        </div>

        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div>
            <div
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              style={{ width: FRAME, height: FRAME, position: 'relative', overflow: 'hidden', borderRadius: 14, border: '2px solid var(--border)', touchAction: 'none', cursor: 'grab', background: '#f4f4f4' }}
            >
              {src && <img src={src} alt="" draggable={false} style={{ position: 'absolute', left: off.x, top: off.y, width: dispW, height: dispH, maxWidth: 'none', userSelect: 'none' }} />}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.45) 1px,transparent 1px)', backgroundSize: `${FRAME / 3}px ${FRAME / 3}px` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <ZoomIn size={16} color="var(--text-sub)" />
              <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={e => onZoom(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--pink)' }} />
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 6 }}>Перетаскивайте фото, ползунком — приближение.</p>
          </div>

          <div style={{ width: PV }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 8, textAlign: 'center' }}>Как в карточке товара:</div>
            <div className="card" style={{ width: PV }}>
              <div style={{ width: PV, height: PV, overflow: 'hidden', position: 'relative', background: '#f4f4f4' }}>
                {src && <img src={src} alt="" draggable={false} style={{ position: 'absolute', left: off.x * k, top: off.y * k, width: dispW * k, height: dispH * k, maxWidth: 'none' }} />}
              </div>
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>Категория</div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.85rem', margin: '2px 0 6px' }}>Название товара</div>
                <span className="font-display" style={{ color: 'var(--pink)', fontWeight: 700 }}>350 000 so&apos;m</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Отмена</button>
          <button onClick={apply} disabled={busy || !img} className="btn-primary" style={{ flex: 1 }}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> Готовим...</> : <><Check size={16} /> Применить</>}
          </button>
        </div>
      </div>
    </div>
  )
}
