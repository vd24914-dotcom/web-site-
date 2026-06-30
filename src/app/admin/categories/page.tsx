'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, Edit2, X, Save, Loader2 } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const d = await fetch('/api/admin/categories').then(r => r.json())
    setCats(d.categories || []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const blank = () => ({ id: null, name: '', emoji: '🧶', icon: '', sortOrder: 0 })

  const save = async () => {
    if (!editing?.name) return
    setSaving(true)
    await fetch('/api/admin/categories', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setSaving(false); setEditing(null); load()
  }

  const del = async (id: number) => {
    if (!confirm('Удалить категорию?')) return
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Категории</h1>
        <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}><Plus size={16} /> Добавить</button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><RefreshCw size={24} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto' }} /></div>
        ) : cats.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-sub)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>Категорий пока нет. Добавьте первую!</div>
        ) : cats.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            {c.icon
              ? <img src={c.icon} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
              : <span style={{ fontSize: 28, width: 40, textAlign: 'center', flexShrink: 0 }}>{c.emoji}</span>}
            <span style={{ flex: 1, fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)', background: 'var(--cream-dark)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>№ {c.sortOrder}</span>
            <button onClick={() => setEditing({ ...c, icon: c.icon || '' })} style={{ background: 'var(--pink-light)', border: 'none', cursor: 'pointer', color: 'var(--pink-dark)', padding: '6px 10px', borderRadius: 8 }}><Edit2 size={14} /></button>
            <button onClick={() => del(c.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '6px 10px', borderRadius: 8 }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,45,58,.28)', backdropFilter: 'blur(6px)', zIndex: 1000, overflowY: 'auto', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 30, maxWidth: 460, margin: '40px auto', position: 'relative' }}>
            <button onClick={() => setEditing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="var(--text-sub)" /></button>
            <h2 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--text)', marginBottom: 20 }}>{editing.id ? 'Редактировать категорию' : 'Новая категория'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ImageUploader value={editing.icon} onChange={url => setEditing({ ...editing, icon: url })} label="Иконка категории (картинка)" hint="Лучше квадратный PNG с прозрачным фоном. Если не загружать — покажется эмодзи." />
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Название *</label>
                <input className="input" placeholder="Например: Сумки" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Эмодзи (запасной)</label>
                  <input className="input" placeholder="🧶" value={editing.emoji || ''} onChange={e => setEditing({ ...editing, emoji: e.target.value })} style={{ fontSize: '1.3rem', textAlign: 'center' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Порядок</label>
                  <input className="input" type="number" value={editing.sortOrder || 0} onChange={e => setEditing({ ...editing, sortOrder: +e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setEditing(null)} className="btn-outline" style={{ flex: 1 }}>Отмена</button>
                <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? <><Loader2 size={16} className="animate-spin" /> Сохраняем...</> : <><Save size={16} /> Сохранить</>}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
