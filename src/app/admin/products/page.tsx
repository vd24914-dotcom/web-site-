'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, X, Save, Loader2, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { MultiImageUploader } from '@/components/MultiImageUploader'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const [p, c] = await Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ])
    setProducts(p.products || []); setCategories(c.categories || []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const blank = () => ({ id: null, name: '', description: '', price: '', categoryId: '', inStock: true, featured: false, metaTitle: '', metaDesc: '', images: [] })

  const openEdit = (p: any) => {
    let imgs: string[] = []
    try { imgs = JSON.parse(p.images || '[]') } catch {}
    setEditing({ ...p, images: imgs })
  }

  const save = async () => {
    if (!editing) return; setSaving(true)
    await fetch('/api/admin/products', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editing, colors: [], sizes: [] })
    })
    await load(); setEditing(null); setSaving(false)
  }

  const del = async (id: number) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Товары</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '.9rem' }}>{products.length} товаров в каталоге</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn-outline" style={{ padding: '.6rem' }}><RefreshCw size={16} /></button>
          <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}>
            <Plus size={16} /> Добавить товар
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
        <input className="input" style={{ paddingLeft: 40 }} placeholder="Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto 12px' }} />
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧶</div>
              <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>{search ? 'Ничего не найдено' : 'Добавьте первый товар!'}</p>
              {!search && <button onClick={() => setEditing(blank())} className="btn-primary" style={{ fontSize: '.85rem' }}><Plus size={16} /> Добавить товар</button>}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream-dark)' }}>
                  {['Фото', 'Товар', 'Категория', 'Цена', 'В наличии', 'Хит', 'Действия'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  let imgs: string[] = []
                  try { imgs = JSON.parse(p.images || '[]') } catch {}
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '10px 16px' }}>
                        {imgs[0] ? (
                          <img src={imgs[0]} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, background: 'var(--pink-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                            {p.category?.emoji || '🧶'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 2 }}>{imgs.length} фото</div>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-sub)', fontSize: '.85rem' }}>{p.category?.emoji} {p.category?.name}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--pink)', fontWeight: 600, fontSize: '.9rem', whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '.8rem', color: p.inStock ? 'var(--green)' : '#ef4444', fontWeight: 600 }}>
                          {p.inStock ? '✓ Да' : '✗ Нет'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>{p.featured ? '⭐' : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ background: 'var(--pink-light)', border: 'none', cursor: 'pointer', color: 'var(--pink-dark)', padding: '6px 10px', borderRadius: 8 }}><Edit2 size={14} /></button>
                          <button onClick={() => del(p.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '6px 10px', borderRadius: 8 }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, overflowY: 'auto', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 660, margin: '40px auto', position: 'relative' }}>
            <button onClick={() => setEditing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="var(--text-sub)" />
            </button>
            <h2 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 24 }}>
              {editing.id ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Photos */}
              <MultiImageUploader
                images={editing.images || []}
                onChange={imgs => setEditing({ ...editing, images: imgs })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Название *</label>
                  <input className="input" placeholder="Свитер «Уют»" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Цена (сум) *</label>
                  <input className="input" type="number" placeholder="450000" value={editing.price || ''} onChange={e => setEditing({ ...editing, price: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Категория</label>
                <select className="input" value={editing.categoryId || ''} onChange={e => setEditing({ ...editing, categoryId: e.target.value })}>
                  <option value="">— Выберите категорию —</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Описание *</label>
                <textarea className="input" rows={3} placeholder="Подробное описание изделия..." value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Цвета (через запятую)</label>
                  <input className="input" placeholder="Белый, Серый, Бежевый"
                    value={Array.isArray(editing.colors) ? editing.colors.join(', ') : ''}
                    onChange={e => setEditing({ ...editing, colors: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Размеры (через запятую)</label>
                  <input className="input" placeholder="XS, S, M, L, XL"
                    value={Array.isArray(editing.sizes) ? editing.sizes.join(', ') : ''}
                    onChange={e => setEditing({ ...editing, sizes: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, padding: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 500, color: 'var(--text)' }}>
                  <input type="checkbox" checked={editing.inStock} onChange={e => setEditing({ ...editing, inStock: e.target.checked })} style={{ width: 16, height: 16 }} />
                  В наличии
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 500, color: 'var(--text)' }}>
                  <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} style={{ width: 16, height: 16 }} />
                  ⭐ Показать на главной
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>SEO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="input" placeholder="SEO заголовок" value={editing.metaTitle || ''} onChange={e => setEditing({ ...editing, metaTitle: e.target.value })} />
                  <input className="input" placeholder="SEO описание (до 160 символов)" value={editing.metaDesc || ''} onChange={e => setEditing({ ...editing, metaDesc: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setEditing(null)} className="btn-outline" style={{ flex: 1 }}>Отмена</button>
                <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Сохраняем...</> : <><Save size={16} /> Сохранить</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
