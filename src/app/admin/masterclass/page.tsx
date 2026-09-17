'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, X, Save, Loader2, Film, Eye, EyeOff, GripVertical } from 'lucide-react'
import { YouTubeIcon } from '@/components/MasterClassCard'
import { ImageUploader } from '@/components/ImageUploader'
import { VideoUploader } from '@/components/VideoUploader'
import { parseYouTubeId, youtubeThumb } from '@/lib/video'

export default function MasterClassAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)

  const load = async () => {
    setLoading(true)
    const [d, s] = await Promise.all([
      fetch('/api/admin/masterclass').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()).catch(() => ({})),
    ])
    setItems(d.items || []); setEnabled(s?.settings?.masterclass_enabled === '1'); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const blank = () => ({ id: null, title: '', description: '', kind: 'youtube', videoUrl: '', cover: '', duration: '', published: true, sortOrder: 0 })

  const save = async () => {
    if (!editing) return
    setSaving(true); setError('')
    const res = await fetch('/api/admin/masterclass', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const d = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(d.error || 'Не удалось сохранить'); return }
    await load(); setEditing(null)
  }

  const del = async (id: number) => {
    if (!confirm('Удалить мастер-класс?')) return
    await fetch(`/api/admin/masterclass?id=${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(n => n.id !== id))
  }

  const togglePublished = async (item: any) => {
    await fetch('/api/admin/masterclass', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, published: !item.published }) })
    setItems(prev => prev.map(n => n.id === item.id ? { ...n, published: !n.published } : n))
  }

  const ytId = editing?.kind === 'youtube' ? parseYouTubeId(editing.videoUrl || '') : null
  const previewCover = editing ? (editing.cover || (ytId ? youtubeThumb(ytId) : '')) : ''

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Мастер-классы</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '.9rem' }}>{items.length} видео · ссылка с YouTube не занимает место в хранилище, загруженный файл — занимает</p>
        </div>
        <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}>
          <Plus size={16} /> Добавить мастер-класс
        </button>
      </div>

      {enabled !== null && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, border: '1px solid', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 10,
          background: enabled ? '#e8f5ec' : 'var(--pink-mist)', borderColor: enabled ? '#bfe3c9' : 'var(--pink-light)', color: enabled ? '#1f5f33' : 'var(--pink-deep)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: enabled ? '#2e7d45' : '#c9c9c9', flexShrink: 0 }} />
          {enabled
            ? <span><b>Раздел включён</b> — посетители видят мастер-классы на сайте.</span>
            : <span><b>Раздел скрыт</b> — посетителям показывается «временно недоступно».</span>}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><RefreshCw size={32} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>Мастер-классов пока нет</p>
          <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}><Plus size={16} /> Добавить мастер-класс</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((n: any) => {
            const cover = n.cover || (n.kind === 'youtube' ? youtubeThumb(n.videoUrl) : '')
            return (
              <div key={n.id} style={{ display: 'flex', gap: 16, background: 'white', borderRadius: 14, padding: 14, border: '1px solid var(--border)', alignItems: 'center', opacity: n.published ? 1 : .6 }}>
                <div style={{ width: 120, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  {cover ? <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎬'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{n.title}</span>
                    <span className="badge" style={{ background: n.kind === 'youtube' ? '#fee2e2' : 'var(--pink-light)', color: n.kind === 'youtube' ? '#b91c1c' : 'var(--pink-deep)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {n.kind === 'youtube' ? <><YouTubeIcon size={12} /> YouTube</> : <><Film size={12} /> Файл</>}
                    </span>
                    {n.duration && <span className="badge badge-gray">{n.duration}</span>}
                    {!n.published && <span className="badge badge-gray">Скрыт</span>}
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.description || '—'}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><GripVertical size={12} /> порядок: {n.sortOrder} · {new Date(n.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => togglePublished(n)} title={n.published ? 'Скрыть с сайта' : 'Показать на сайте'} style={{ background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', padding: '8px 10px', borderRadius: 8 }}>{n.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button onClick={() => { setError(''); setEditing({ ...n, cover: n.cover || '', duration: n.duration || '' }) }} style={{ background: 'var(--pink-light)', border: 'none', cursor: 'pointer', color: 'var(--pink-dark)', padding: '8px 10px', borderRadius: 8 }}><Edit2 size={14} /></button>
                  <button onClick={() => del(n.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '8px 10px', borderRadius: 8 }}><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,45,58,.28)', backdropFilter: 'blur(6px)', zIndex: 1000, overflowY: 'auto', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 640, margin: '40px auto', position: 'relative' }}>
            <button onClick={() => setEditing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="var(--text-sub)" />
            </button>
            <h2 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 20 }}>
              {editing.id ? 'Редактировать мастер-класс' : 'Новый мастер-класс'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Источник видео */}
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>Откуда видео</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'youtube', icon: <YouTubeIcon size={18} />, title: 'Ссылка с YouTube', sub: 'Не занимает место, рекомендуется' },
                    { key: 'file', icon: <Film size={18} />, title: 'Загрузить файл', sub: 'MP4 до 500 МБ, хранится в Blob' },
                  ].map(o => {
                    const active = editing.kind === o.key
                    return (
                      <button key={o.key} type="button" onClick={() => setEditing({ ...editing, kind: o.key, videoUrl: '' })}
                        style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: '2px solid', transition: 'all .15s',
                          borderColor: active ? 'var(--pink)' : 'var(--border)', background: active ? 'var(--pink-mist)' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: active ? 'var(--pink-deep)' : 'var(--text)', fontSize: '.9rem' }}>{o.icon} {o.title}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 4 }}>{o.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {editing.kind === 'youtube' ? (
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Ссылка на YouTube *</label>
                  <input className="input" placeholder="https://www.youtube.com/watch?v=..." value={editing.videoUrl || ''} onChange={e => setEditing({ ...editing, videoUrl: e.target.value })} />
                  {editing.videoUrl && !ytId && <p style={{ color: '#e53e3e', fontSize: '.78rem', marginTop: 6 }}>Не похоже на ссылку YouTube</p>}
                  {ytId && <p style={{ color: '#2e7d45', fontSize: '.78rem', marginTop: 6 }}>✓ Ролик найден, обложка подтянется с YouTube автоматически</p>}
                </div>
              ) : (
                <VideoUploader value={editing.videoUrl} onChange={url => setEditing({ ...editing, videoUrl: url })} label="Видеофайл *" />
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Название *</label>
                <input className="input" placeholder="Например: Шапка-бини за вечер" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Описание</label>
                <textarea className="input" rows={3} placeholder="Что научимся вязать, какие нитки и спицы нужны..." value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Длительность</label>
                  <input className="input" placeholder="12:30" value={editing.duration || ''} onChange={e => setEditing({ ...editing, duration: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Порядок (меньше — выше)</label>
                  <input className="input" type="number" value={editing.sortOrder ?? 0} onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <ImageUploader value={editing.cover} onChange={url => setEditing({ ...editing, cover: url })} label="Обложка (необязательно)" hint={editing.kind === 'youtube' ? 'Если не загружать — возьмём превью с YouTube' : 'Кадр 16:9. Без обложки покажем первый кадр видео'} />
                {!editing.cover && previewCover && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={previewCover} alt="" style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>Так будет выглядеть обложка с YouTube</span>
                  </div>
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 600, color: 'var(--text)', background: 'var(--pink-mist)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={!!editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} style={{ width: 16, height: 16 }} />
                <Eye size={15} /> Показывать на сайте
              </label>

              {error && <p style={{ color: '#e53e3e', fontSize: '.85rem', background: '#fee2e2', padding: '10px 12px', borderRadius: 10 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setEditing(null)} className="btn-outline" style={{ flex: 1 }}>Отмена</button>
                <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Сохраняем...</> : <><Save size={16} /> {editing.id ? 'Сохранить' : 'Опубликовать'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
