'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  text: string
  style?: React.CSSProperties
  speed?: number
}

// Печатает текст по буквам, когда попадает в зону видимости. Затем мигает курсор.
export function Typewriter({ text, style, speed = 85 }: Props) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        let i = 0
        const id = setInterval(() => {
          i++
          setShown(text.slice(0, i))
          if (i >= text.length) { clearInterval(id); setDone(true) }
        }, speed)
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [text, speed])

  return (
    <span ref={ref} style={style}>
      {shown}
      <span className="type-caret" style={{ opacity: done ? undefined : 1 }}>|</span>
    </span>
  )
}
