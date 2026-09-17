'use client'
import { useState, useEffect, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * Переключатель темы с плавной анимацией.
 * В браузерах с View Transitions новая тема расходится круговой волной от кнопки,
 * в остальных — все цвета плавно перетекают (класс theme-transition на <html>).
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  const applyTheme = (next: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
    setDark(next === 'dark')
  }

  const toggle = () => {
    if (busy.current) return
    const next: 'light' | 'dark' = dark ? 'light' : 'dark'
    const root = document.documentElement
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }

    // Плавный запасной вариант: перетекание цветов
    if (reduce || typeof doc.startViewTransition !== 'function') {
      root.classList.add('theme-transition')
      applyTheme(next)
      window.setTimeout(() => root.classList.remove('theme-transition'), 650)
      return
    }

    // Круговая волна от кнопки
    busy.current = true
    const rect = btnRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
    const y = rect ? rect.top + rect.height / 2 : 34
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const vt = doc.startViewTransition(() => applyTheme(next))
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      )
    }).catch(() => {})
    vt.finished.finally(() => { busy.current = false })
  }

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      className="theme-toggle"
      style={{
        width: 54,
        height: 28,
        borderRadius: 50,
        border: '1px solid var(--border)',
        background: dark ? 'linear-gradient(135deg,#2b2356,#3a2d6b)' : 'linear-gradient(135deg,#ffe2a8,#ffd0e0)',
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background .45s ease, box-shadow .3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Звёздочки в тёмном режиме */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: mounted && dark ? 1 : 0, transition: 'opacity .45s ease', pointerEvents: 'none' }}>
        <i style={{ position: 'absolute', left: 9, top: 7, width: 2, height: 2, borderRadius: '50%', background: '#fff', boxShadow: '0 0 4px #fff' }} />
        <i style={{ position: 'absolute', left: 16, top: 17, width: 1.5, height: 1.5, borderRadius: '50%', background: '#fff' }} />
        <i style={{ position: 'absolute', left: 6, top: 18, width: 1.5, height: 1.5, borderRadius: '50%', background: '#fff', opacity: .7 }} />
      </span>
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: mounted && dark ? 28 : 2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,.35)',
          transition: 'left .45s cubic-bezier(.34,1.56,.64,1), transform .45s ease',
          transform: mounted && dark ? 'rotate(360deg)' : 'rotate(0deg)',
        }}
      >
        {dark ? <Moon size={13} color="#5a4bd0" /> : <Sun size={13} color="#f5a623" />}
      </span>
    </button>
  )
}
