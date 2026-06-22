'use client'
import { useState, useRef } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import { ImageCropEditor } from '@/components/ImageCropEditor'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

export function MultiImageUploader({ images, onChange }: Props) {
  const [queue, setQueue] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const onSelect = (files: FileList) => {
    setError('')
    const imgs = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { setError('Можно загружать только изображения'); return false }
      if (f.size > 25 * 1024 * 1024) { setError('Слишком большой файл: ' + f.name); return false }
      return true
    })
    if (imgs.length) setQueue(imgs)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleConfirm = async (blob: Blob) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', blob, 'photo.webp')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) onChange([...images, data.url])
      else setError(data.error || 'Ошибка загрузки')
    } catch {
      setError('Не удалось загрузить фото')
    }
    setUploading(false)
    setQueue(q => q.slice(1))
  }

  const handleCancel = () => setQueue(q => q.slice(1))

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx))

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>
        Фотографии товара
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: images.length > 0 ? 12 : 0 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={img} alt={`Фото ${i + 1}`} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: i === 0 ? '2px solid var(--pink)' : '2px solid var(--border)', display: 'block' }} />
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--pink)', color: 'white', fontSize: '.65rem', textAlign: 'center', borderRadius: '0 0 8px 8px', padding: '2px 0', fontWeight: 600 }}>ГЛАВНОЕ</div>}
            <button onClick={() => remove(i)}
              style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <X size={10} />
            </button>
          </div>
        ))}

        <div onClick={() => !uploading && inputRef.current?.click()}
          style={{ width: 90, height: 90, border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', transition: 'all .2s', gap: 4 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pink)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={e => e.target.files && onSelect(e.target.files)} />
          {uploading ? <Loader2 size={20} className="animate-spin" style={{ color: 'var(--pink)' }} /> : <Plus size={20} style={{ color: 'var(--text-sub)' }} />}
          <span style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>{uploading ? 'Загрузка' : 'Добавить'}</span>
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '.8rem', marginTop: 6 }}>⚠️ {error}</p>}
      <p style={{ color: 'var(--text-sub)', fontSize: '.75rem', marginTop: 4 }}>Первое фото — главное. При добавлении откроется редактор кадрирования.</p>

      {queue[0] && (
        <ImageCropEditor file={queue[0]} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  )
}
