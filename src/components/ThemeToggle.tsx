'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
    setDark(!dark)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
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
        transition: 'background .35s ease',
      }}
    >
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
          transition: 'left .35s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {dark ? <Moon size={13} color="#5a4bd0" /> : <Sun size={13} color="#f5a623" />}
      </span>
    </button>
  )
}
