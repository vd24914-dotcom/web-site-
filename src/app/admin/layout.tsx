'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut, Palette, Newspaper, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/admin',            icon: <LayoutDashboard size={17} />, label: 'Главная' },
  { href: '/admin/orders',     icon: <ShoppingBag size={17} />,     label: 'Заявки' },
  { href: '/admin/products',   icon: <Package size={17} />,         label: 'Товары' },
  { href: '/admin/categories', icon: <Tag size={17} />,             label: 'Категории' },
  { href: '/admin/news',       icon: <Newspaper size={17} />,       label: 'Новости' },
  { href: '/admin/appearance', icon: <Palette size={17} />,         label: 'Дизайн и контент' },
  { href: '/admin/settings',   icon: <Settings size={17} />,        label: 'Настройки' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Страница входа — без меню
  if (pathname === '/admin/login') {
    return <div className="force-light">{children}</div>
  }

  return (
    <div className="force-light" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Верхняя панель (только на телефоне) */}
      <div className="admin-topbar">
        <button onClick={() => setOpen(true)} aria-label="Меню" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <Menu size={22} color="var(--text)" />
        </button>
        <img src="/admin-logo.png" alt="Fimush.kin Админ" style={{ height: 36, width: 'auto' }} />
      </div>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div style={{ padding: '4px 6px 18px', borderBottom: '1px solid var(--border)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <img src="/admin-logo.png" alt="Fimush.kin Админ" style={{ width: 150, maxWidth: '100%', display: 'block' }} />
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
