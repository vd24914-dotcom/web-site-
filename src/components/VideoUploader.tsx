'use client'
import { useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { Upload, X, Loader2, Film, CheckCircle } from 'lucide-react'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
  hint?: string
}

/** Загрузка видео напрямую в Vercel Blob с прогрессом */
export function VideoUploader({ value, onChange, label, hint }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const doUpload = async (file: File) => {
    setUploading(true); setError(''); setSuccess(false); setProgress(0)
    try {
      if (!file.type.startsWith('video/')) throw new Error('Это не видео. Подойдут MP4, WebM или MOV')
      if (file.size > 500 * 1024 * 1024) throw new Error('Файл слишком большой (макс. 500 МБ)')
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
      const blob = await upload(`masterclass/${Date.now()}.${ext}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/video',
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      onChange(blob.url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки')
    }
    setUploading(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) doUpload(f)
  }

  return (
    <div>
      {label && <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>{label}</label>}

      {value && !uploading && (
        <div style={{ position: 'relative', marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#000' }}>
          <video src={value} controls preload="metadata" playsInline style={{ width: '100%', maxHeight: 260, display: 'block' }} />
          <button type="button" onClick={() => onChange('')} title="Убрать видео"
            style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.92)', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div
        onDragOver={e => e.preventDefault()} onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: uploading ? 'default' : 'pointer', background: 'var(--pink-mist)', transition: 'border-color .2s' }}>
        {uploading ? (
          <div>
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: '.85rem', color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>Загружаем… {progress}%</div>
            <div style={{ height: 8, borderRadius: 999, background: 'var(--pink-light)', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--pink)', transition: 'width .2s' }} />
            </div>
          </div>
        ) : success ? (
          <div style={{ color: '#2e7d45', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: '.9rem' }}><CheckCircle size={20} /> Видео загружено</div>
        ) : (
          <div>
            {value ? <Upload size={24} style={{ color: 'var(--pink)', margin: '0 auto 8px' }} /> : <Film size={28} style={{ color: 'var(--pink)', margin: '0 auto 8px' }} />}
            <div style={{ fontSize: '.875rem', color: 'var(--text)', fontWeight: 500 }}>{value ? 'Заменить видео' : 'Перетащите видео или нажмите для выбора'}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 4 }}>{hint || 'MP4, WebM или MOV, до 500 МБ'}</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = '' }} />
      {error && <p style={{ color: '#e53e3e', fontSize: '.8rem', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
