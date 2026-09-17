'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut, Palette, Newspaper, Menu, X, GraduationCap } from 'lucide-react'

/**
 * Скрытый переключатель раздела «Мастер-классы»: клик по логотипу в левом верхнем
 * углу админки включает или выключает раздел на сайте (настройка masterclass_enabled).
 */
function useMasterclassToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => setEnabled(d?.settings?.masterclass_enabled === '1')).catch(() => {})
  }, [])

  const toggle = async () => {
    if (busy || enabled === null) return
    setBusy(true)
    const next = !enabled
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { masterclass_enabled: next ? '1' : '' } }),
    }).catch(() => null)
    setBusy(false)
    if (!res || !res.ok) { setToast('Не удалось сохранить'); setTimeout(() => setToast(''), 2500); return }
    setEnabled(next)
    setToast(next ? '🎓 Мастер-классы включены на сайте' : '🔒 Мастер-классы скрыты: «временно недоступно»')
    setTimeout(() => setToast(''), 3000)
  }

  return { enabled, toggle, toast }
}

const NAV = [
  { href: '/admin',            icon: <LayoutDashboard size={17} />, label: 'Главная' },
  { href: '/admin/orders',     icon: <ShoppingBag size={17} />,     label: 'Заявки' },
  { href: '/admin/products',   icon: <Package size={17} />,         label: 'Товары' },
  { href: '/admin/categories', icon: <Tag size={17} />,             label: 'Категории' },
  { href: '/admin/news',       icon: <Newspaper size={17} />,       label: 'Новости' },
  { href: '/admin/masterclass', icon: <GraduationCap size={17} />,  label: 'Мастер-классы' },
  { href: '/admin/appearance', icon: <Palette size={17} />,         label: 'Дизайн и контент' },
  { href: '/admin/settings',   icon: <Settings size={17} />,        label: 'Настройки' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const mc = useMasterclassToggle()

  // Страница входа — без меню
  if (pathname === '/admin/login') {
    return <div className="force-light">{children}</div>
  }

  const logoBtn = (style: React.CSSProperties) => (
    <button type="button" onClick={mc.toggle} aria-label="Логотип"
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'default', position: 'relative', display: 'block' }}>
      <img src="/admin-logo.png" alt="Fimush.kin Админ" style={style} />
      {mc.enabled !== null && (
        <span aria-hidden="true" style={{ position: 'absolute', right: -4, top: -4, width: 9, height: 9, borderRadius: '50%', background: mc.enabled ? '#2e7d45' : '#c9c9c9', border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.06)' }} />
      )}
    </button>
  )

  return (
    <div className="force-light" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Верхняя панель (только на телефоне) */}
      <div className="admin-topbar">
        <button onClick={() => setOpen(true)} aria-label="Меню" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <Menu size={22} color="var(--text)" />
        </button>
        {logoBtn({ height: 36, width: 'auto' })}
      </div>

      {mc.toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 2000, background: 'var(--text)', color: 'white', padding: '12px 18px', borderRadius: 12, fontSize: '.85rem', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }}>
          {mc.toast}
        </div>
      )}

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div style={{ padding: '4px 6px 18px', borderBottom: '1px solid var(--border)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          {logoBtn({ width: 150, maxWidth: '100%', display: 'block' })}
          <button onClick={() => setOpen(false)} className="admin-close" aria-label="Закрыть" style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={20} color="var(--text-sub)" />
          </button>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className="admin-link" onClick={() => setOpen(false)}>{item.icon} {item.label}</Link>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <form action="/api/admin/auth/logout" method="POST">
            <button type="submit" className="admin-link" style={{ color: 'var(--pink-dark)' }}>
              <LogOut size={17} /> Выйти
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  )
}
