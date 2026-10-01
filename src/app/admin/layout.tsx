'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut, Type, Newspaper, Menu, X, ExternalLink } from 'lucide-react'

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Обзор' },
  { href: '/admin/orders',     icon: ShoppingBag,     label: 'Заявки' },
  { href: '/admin/products',   icon: Package,         label: 'Товары' },
  { href: '/admin/categories', icon: Tag,             label: 'Категории' },
  { href: '/admin/news',       icon: Newspaper,       label: 'Новости' },
  { href: '/admin/appearance', icon: Type,            label: 'Контент сайта' },
  { href: '/admin/settings',   icon: Settings,        label: 'Настройки' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Страница входа — без меню
  if (pathname === '/admin/login') return <div className="force-light admin-shell">{children}</div>

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)

  return (
    <div className="force-light admin-shell">
      <div className="admin-topbar">
        <button onClick={() => setOpen(true)} aria-label="Меню" className="ad-icon-btn"><Menu size={20} /></button>
        <span className="ad-brand-text">Fimush.kin · Админка</span>
      </div>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="ad-brand">
          <img src="/admin-logo.png" alt="Fimush.kin" />
          <button onClick={() => setOpen(false)} className="admin-close ad-icon-btn" aria-label="Закрыть"><X size={18} /></button>
        </div>
        <nav className="ad-nav">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={`admin-link${isActive(href) ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={17} strokeWidth={1.9} /> {label}
            </Link>
          ))}
        </nav>
        <div className="ad-nav-foot">
          <a href="/" target="_blank" className="admin-link"><ExternalLink size={17} strokeWidth={1.9} /> Открыть сайт</a>
          <form action="/api/admin/auth/logout" method="POST">
            <button type="submit" className="admin-link"><LogOut size={17} strokeWidth={1.9} /> Выйти</button>
          </form>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  )
}
