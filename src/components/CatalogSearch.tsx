'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Props { q?: string; category?: string }

/** Строка поиска на странице каталога: отправляет ?q= с сохранением категории */
export function CatalogSearch({ q = '', category }: Props) {
  const [value, setValue] = useState(q)
  const router = useRouter()

  const go = (query: string) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (query.trim()) params.set('q', query.trim())
    const qs = params.toString()
    router.push(qs ? `/catalog?${qs}` : '/catalog')
  }

  return (
    <form onSubmit={e => { e.preventDefault(); go(value) }} role="search"
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 6px 6px 16px', width: 'min(420px, 100%)', boxShadow: '0 6px 24px rgba(250,135,161,.12)' }}>
      <Search size={18} style={{ color: 'var(--pink)', flexShrink: 0 }} />
      <input value={value} onChange={e => setValue(e.target.value)} placeholder="Найти изделие…" aria-label="Поиск по каталогу"
        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: '.95rem', color: 'var(--text)' }} />
      {value && (
        <button type="button" onClick={() => { setValue(''); go('') }} aria-label="Очистить"
          style={{ border: 0, background: 'var(--cream-dark)', color: 'var(--text-sub)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <X size={14} />
        </button>
      )}
      <button type="submit" className="btn-primary" style={{ padding: '.5rem 1rem', fontSize: '.85rem', borderRadius: 999 }}>Найти</button>
    </form>
  )
}
