'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props { settings?: Record<string, string> }

export function Header({ settings = {} }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const goBack = () => { if (typeof window !== 'undefined' && window.history.length > 1) router.back(); else router.push('/') }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const logo = settings.logo_image
  const logoEmoji = settings.logo_emoji || '🧶'
  const siteName = settings.site_name || 'Fimush.kin'
  const showText = settings.logo_show_text !== '0'
  const links = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/sale',    label: '🏷 Скидки' },
    { href: '/news',    label: '📰 Новости' },
    { href: '/#about',  label: 'О нас'   },
    { href: '/#contact',label: 'Контакты'},
  ]

  return (
    <header style={{
      background: scrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
      transition: 'background .3s, box-shadow .3s',
      boxShadow: scrolled ? '0 4px 24px rgba(250,135,161,.12)' : 'none',
    }}>
      <div className="container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo
            ? <img src={logo} alt={siteName} style={{ height: showText ? 40 : 56, width: 'auto', maxWidth: showText ? 150 : 230, objectFit: 'contain', borderRadius: 8, transition: 'height .2s' }} />
            : <span className="icon-bounce" style={{ fontSize: showText ? 28 : 40, cursor: 'pointer' }}>{logoEmoji}</span>
          }
          {showText && <span className="font-display" style={{ fontSize: '1.35rem', color: 'var(--text)', fontWeight: 700 }}>{siteName}</span>}
        </Link>

        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle />
          <Link href="/catalog" className="btn-primary hide-mobile" style={{ padding: '.55rem 1.25rem', fontSize: '.85rem' }}>Заказать</Link>
          {!isHome && (
            <button onClick={goBack} className="show-mobile" aria-label="Назад"
              style={{ background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={22} color="var(--text)" />
            </button>
          )}
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="show-mobile" aria-label="Menu">
            {open ? <X size={22} color="var(--pink)" /> : <Menu size={22} color="var(--text)" />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '16px 24px 20px' }}>
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '12px 0', color: 'var(--text)', textDecoration: 'none', borderBottom: i < links.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '1rem', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
          <Link href="/catalog" className="btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>Заказать</Link>
        </div>
      )}

      <style>{`.show-mobile{display:none}@media(max-width:768px){.show-mobile{display:flex!important}.hide-mobile{display:none!important}}`}</style>
    </header>
  )
}
