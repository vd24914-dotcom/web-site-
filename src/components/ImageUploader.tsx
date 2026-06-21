'use client'
import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { resizeImageToBlob } from '@/lib/image'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
  hint?: string
}

export function ImageUploader({ value, onChange, label, hint }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true); setError(''); setSuccess(false)
    try {
      if (!file.type.startsWith('image/')) throw new Error('Это не изображение')
      if (file.size > 25 * 1024 * 1024) throw new Error('Файл слишком большой (макс. 25MB)')
      const blob = await resizeImageToBlob(file)
      const fd = new FormData()
      fd.append('file', blob, 'photo.webp')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      onChange(data.url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки')
    }
    setUploading(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div>
      {label && <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>{label}</label>}

      {/* Preview */}
      {value && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <img src={value} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border)', display: 'block' }} />
          <button onClick={() => onChange('')}
            style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${uploading ? 'var(--pink)' : 'var(--border)'}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: uploading ? 'rgba(200,132,122,.05)' : 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pink)')}
        onMouseLeave={e => !uploading && (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          style={{ display: 'none' }} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
        {uploading ? (
          <><Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto 8px' }} /><p style={{ color: 'var(--pink)', fontSize: '.85rem' }}>Загружаем...</p></>
        ) : success ? (
          <><CheckCircle size={24} style={{ color: 'var(--green)', margin: '0 auto 8px' }} /><p style={{ color: 'var(--green)', fontSize: '.85rem', fontWeight: 600 }}>Загружено!</p></>
        ) : (
          <>
            <Upload size={24} style={{ color: 'var(--text-sub)', margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--text)', fontSize: '.875rem', fontWeight: 500, marginBottom: 4 }}>Нажмите или перетащите файл</p>
            <p style={{ color: 'var(--text-sub)', fontSize: '.78rem' }}>JPG, PNG, WebP, SVG — любой размер</p>
          </>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '.8rem', marginTop: 6 }}>⚠️ {error}</p>}
      {hint && <p style={{ color: 'var(--text-sub)', fontSize: '.78rem', marginTop: 6 }}>{hint}</p>}
    </div>
  )
}
