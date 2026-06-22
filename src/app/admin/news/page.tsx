'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, X, Save, Loader2, Send } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'

export default function NewsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const d = await fetch('/api/admin/news').then(r => r.json())
    setItems(d.news || []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const blank = () => ({ id: null, title: '', content: '', image: '', published: true, postToChannel: true })

  const save = async () => {
    if (!editing) return; setSaving(true)
    await fetch('/api/admin/news', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    await load(); setEditing(null); setSaving(false)
  }

  const del = async (id: number) => {
    if (!confirm('Удалить новость?')) return
    await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Новости</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '.9rem' }}>{items.length} новостей · при публикации можно сразу отправить в Telegram-канал</p>
        </div>
        <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}>
          <Plus size={16} /> Добавить новость
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><RefreshCw size={32} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
          <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>Новостей пока нет</p>
          <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}><Plus size={16} /> Добавить новость</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((n: any) => (
            <div key={n.id} style={{ display: 'flex', gap: 16, background: 'white', borderRadius: 14, padding: 16, border: '1px solid var(--border)', alignItems: 'center' }}>
              {n.image
                ? <img src={n.image} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                : <div style={{ width: 70, height: 70, background: 'var(--pink-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📰</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('ru-RU')}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing({ ...n })} style={{ background: 'var(--pink-light)', border: 'none', cursor: 'pointer', color: 'var(--pink-dark)', padding: '8px 10px', borderRadius: 8 }}><Edit2 size={14} /></button>
                <button onClick={() => del(n.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '8px 10px', borderRadius: 8 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,45,58,.28)', backdropFilter: 'blur(6px)', zIndex: 1000, overflowY: 'auto', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 600, margin: '40px auto', position: 'relative' }}>
            <button onClick={() => setEditing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="var(--text-sub)" />
            </button>
            <h2 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 24 }}>
              {editing.id ? 'Редактировать новость' : 'Новая новость'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <ImageUploader value={editing.image} onChange={url => setEditing({ ...editing, image: url })} label="Картинка новости" />
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Заголовок *</label>
                <input className="input" placeholder="Например: Новая зимняя коллекция!" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Текст *</label>
                <textarea className="input" rows={5} placeholder="Расскажите новость..." value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} />
              </div>

              {!editing.id && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 600, color: 'var(--text)', background: 'var(--pink-mist)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <input type="checkbox" checked={!!editing.postToChannel} onChange={e => setEditing({ ...editing, postToChannel: e.target.checked })} style={{ width: 16, height: 16 }} />
                  <Send size={15} /> Сразу опубликовать в Telegram-канал
                </label>
              )}

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
