'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchBox } from '@/components/SearchBox'
import { CartButton } from '@/components/CartButton'
import { useT } from '@/components/SiteText'

interface Props { settings?: Record<string, string> }

export function Header({ settings = {} }: Props) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const goBack = () => { if (typeof window !== 'undefined' && window.history.length > 1) router.back(); else router.push('/') }

  // Шапка прячется при прокрутке вниз и выезжает обратно при прокрутке вверх
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false
    const update = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      const delta = y - lastY
      if (y < 80) setHidden(false)                 // у самого верха всегда видна
      else if (delta > 6) setHidden(true)          // едем вниз — прячем
      else if (delta < -6) setHidden(false)        // едем вверх — показываем
      lastY = y
      ticking = false
    }
    const fn = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  // Пока открыто мобильное меню, шапку не прячем
  const headerHidden = hidden && !open

  const logo = settings.logo_image
  const logoEmoji = t('logo_emoji')
  const siteName = t('site_name')
  const showText = settings.logo_show_text !== '0'
  const links = [
    { href: '/catalog', label: t('nav_catalog') },
    { href: '/sale',    label: t('nav_sale') },
    { href: '/news',    label: t('nav_news') },
    { href: '/#about',  label: t('nav_about') },
    { href: '/#contact',label: t('nav_contacts') },
  ]

  return (
    <header style={{
      background: scrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
      transform: headerHidden ? 'translateY(-110%)' : 'translateY(0)',
      opacity: headerHidden ? 0 : 1,
      transition: 'transform .42s cubic-bezier(.22,.68,0,1.05), opacity .3s ease, background .3s, box-shadow .3s',
      willChange: 'transform',
      boxShadow: scrolled ? '0 4px 24px rgba(250,135,161,.12)' : 'none',
    }}>
      <div className="container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo
            ? <img src={logo} alt={siteName} className="site-logo" style={{ height: showText ? 40 : 56, width: 'auto', maxWidth: showText ? 150 : 230, objectFit: 'contain', borderRadius: 8, transition: 'height .2s' }} />
            : <span className="icon-bounce" style={{ fontSize: showText ? 28 : 40, cursor: 'pointer' }}>{logoEmoji}</span>
          }
          {showText && <span className="font-display" style={{ fontSize: '1.35rem', color: 'var(--text)', fontWeight: 700 }}>{siteName}</span>}
        </Link>

        <nav className="hide-mobile site-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="hide-mobile search-full" style={{ display: 'inline-flex' }}><SearchBox /></span>
          <span className="search-compact"><SearchBox compact /></span>
          <ThemeToggle />
          <CartButton />
          <Link href="/catalog" className="btn-primary hide-mobile" style={{ padding: '.55rem 1.25rem', fontSize: '.85rem' }}>{t('header_order_btn')}</Link>
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
          <Link href="/catalog" className="btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>{t('header_order_btn')}</Link>
        </div>
      )}

      <style>{`.show-mobile{display:none}@media(max-width:768px){.show-mobile{display:flex!important}.hide-mobile{display:none!important}}`}</style>
    </header>
  )
}
