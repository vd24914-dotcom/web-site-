'use client'
import { useEffect, useRef } from 'react'

/**
 * Анимированные контурные линии — тот же узор, что на сайте KIMI: аналитическое
 * поле из четырёх синусов, прокатываемое двумя волнами, и его изолинии,
 * нарисованные marching squares на canvas. Цвет берётся из CSS-свойства `color`
 * холста (задаётся переменной `--contour-color`, в тёмной теме другой).
 */
interface Props {
  className?: string
  /** Частота узора */
  scale?: number
  /** Сколько полос изолиний */
  count?: number
  /** Скорость волны */
  speed?: number
  /** Прозрачность линий */
  opacity?: number
}

const CELLS = 96
const WAVE_AMOUNT = 0.37
const FRAME_MS = 24

const field = (x: number, y: number, t: number) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25
  return f * 0.5 + 0.5
}

export function ContourLines({ className, scale = 3.8, count = 2.5, speed = 1.66, opacity = 0.85 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0, height = 0, ratio = 1
    const size = () => {
      width = canvas.clientWidth; height = canvas.clientHeight
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }
    const ro = new ResizeObserver(size)
    ro.observe(canvas)
    size()

    const start = performance.now()
    let last = 0
    let raf = 0

    const draw = (now: number) => {
      if (!width || !height) return
      const t = ((now - start) / 1000) * speed
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      const cols = width >= height ? CELLS : Math.max(8, Math.round((CELLS * width) / height))
      const rows = Math.max(8, Math.round((cols * height) / width))
      const stepX = width / cols, stepY = height / rows, aspect = width / height
      const values = new Float32Array((cols + 1) * (rows + 1))
      for (let j = 0; j <= rows; j += 1) for (let i = 0; i <= cols; i += 1) {
        const nx = ((i / cols) * 2 - 1) * aspect * scale
        const ny = ((j / rows) * 2 - 1) * scale
        const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT
        const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT
        values[j * (cols + 1) + i] = field(qx, qy, t) * count
      }
      context.strokeStyle = getComputedStyle(canvas).color
      context.lineWidth = 1
      context.globalAlpha = opacity
      context.beginPath()
      const seg = (p: number[], q: number[]) => { context.moveTo(p[0], p[1]); context.lineTo(q[0], q[1]) }
      for (let level = 0.5; level < count; level += 1)
        for (let j = 0; j < rows; j += 1) for (let i = 0; i < cols; i += 1) {
          const a = values[j * (cols + 1) + i], b = values[j * (cols + 1) + i + 1]
          const c = values[(j + 1) * (cols + 1) + i + 1], d = values[(j + 1) * (cols + 1) + i]
          const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0)
          if (index === 0 || index === 15) continue
          const x0 = i * stepX, y0 = j * stepY
          const top = [x0 + stepX * ((level - a) / (b - a)), y0]
          const right = [x0 + stepX, y0 + stepY * ((level - b) / (c - b))]
          const bottom = [x0 + stepX * ((level - d) / (c - d)), y0 + stepY]
          const left = [x0, y0 + stepY * ((level - a) / (d - a))]
          switch (index) {
            case 1: case 14: seg(left, bottom); break
            case 2: case 13: seg(bottom, right); break
            case 3: case 12: seg(left, right); break
            case 4: case 11: seg(top, right); break
            case 6: case 9: seg(top, bottom); break
            case 7: case 8: seg(left, top); break
            case 5: seg(left, top); seg(bottom, right); break
            case 10: seg(left, bottom); seg(top, right); break
          }
        }
      context.stroke()
      context.globalAlpha = 1
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      if (now - last < FRAME_MS) return
      last = now
      draw(now)
    }
    if (reduced) draw(start)
    else raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [scale, count, speed, opacity])

  return <canvas ref={ref} aria-hidden="true" className={className} style={{ display: 'block', width: '100%', height: '100%' }} />
}
