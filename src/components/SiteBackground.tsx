'use client'
import { usePathname } from 'next/navigation'
import { GradientBackground } from '@/components/ui/floral-veil'
import { ContourLines } from '@/components/ui/contour-lines'

/**
 * Фон всего сайта: градиент «Floral Veil» и поверх него анимированные контурные
 * линии. Слой закреплён за страницей (position: fixed, z-index −1); секции и
 * body делаются прозрачными в globals.css по селектору `body:has(> .site-veil)`.
 * В админке не показывается.
 */
export function SiteBackground() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return (
    <div className="site-veil" aria-hidden="true">
      <div className="site-veil-layer"><GradientBackground /></div>
      <div className="site-veil-layer site-veil-lines"><ContourLines /></div>
      <div className="site-veil-layer veil-dim" />
    </div>
  )
}
