'use client'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Наверх"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#FA87A1,#e06080)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(250,135,161,.5)',
        zIndex: 900,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(16px) scale(.8)',
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .25s, transform .25s',
      }}
    >
      <ArrowUp size={22} />
    </button>
  )
}
