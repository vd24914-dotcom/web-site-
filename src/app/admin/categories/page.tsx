'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', emoji: '🧶', sortOrder: 0 })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/categories')
    const d = await r.json()
    setCats(d.categories || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.name) return
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ name: '', emoji: '🧶', sortOrder: 0 })
    load()
  }

  const del = async (id: number) => {
    if (!confirm('Удалить категорию?')) return
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: 28 }}>Категории</h1>

      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 16, fontSize: '1rem' }}>Добавить категорию</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 80 }} placeholder="🧶" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} />
          <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="Название категории" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && add()} />
          <input className="input" style={{ width: 90 }} type="number" placeholder="Порядок" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
          <button onClick={add} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Добавить
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto' }} />
          </div>
        ) : cats.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-sub)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
            Категорий пока нет. Добавьте первую!
          </div>
        ) : cats.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 28 }}>{c.emoji}</span>
            <span style={{ flex: 1, fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)', background: 'var(--cream-dark)', padding: '4px 10px', borderRadius: 20 }}>Порядок: {c.sortOrder}</span>
            <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6, borderRadius: 8, transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
