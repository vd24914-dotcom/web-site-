'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

interface Props { settings?: Record<string, string> }

export function Header({ settings = {} }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const logo = settings.logo_image
  const logoEmoji = settings.logo_emoji || '🧶'
  const siteName = settings.site_name || 'УютНить'
  const links = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/#about',  label: 'О нас'   },
    { href: '/#contact',label: 'Контакты'},
  ]

  return (
    <header style={{
      background: scrolled ? 'rgba(255,243,230,.96)' : 'rgba(255,255,255,.98)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
      transition: 'background .3s, box-shadow .3s',
      boxShadow: scrolled ? '0 4px 24px rgba(250,135,161,.12)' : 'none',
    }}>
      <div className="container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo
            ? <img src={logo} alt={siteName} style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 8 }} />
            : <span className="icon-bounce" style={{ fontSize: 28, cursor: 'pointer' }}>{logoEmoji}</span>
          }
          <span className="font-display" style={{ fontSize: '1.35rem', color: 'var(--text)', fontWeight: 700 }}>{siteName}</span>
        </Link>

        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/catalog" className="btn-primary hide-mobile" style={{ padding: '.55rem 1.25rem', fontSize: '.85rem' }}>Заказать</Link>
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
