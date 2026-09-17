// Помощники для видео мастер-классов: YouTube-ссылки и загруженные файлы

export type VideoKind = 'youtube' | 'file'

/** Достаёт ID ролика из любой ссылки YouTube (watch, youtu.be, shorts, embed, live) */
export function parseYouTubeId(input: string): string | null {
  const s = (input || '').trim()
  if (!s) return null
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = s.match(p)
    if (m) return m[1]
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

export function youtubeEmbedUrl(id: string, autoplay = true) {
  const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
  if (autoplay) q.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

/** Нормализует длительность: «12:05», «1:02:30» или пусто */
export function normalizeDuration(input: string): string {
  const s = (input || '').trim()
  if (!s) return ''
  if (/^\d{1,2}(:\d{2}){1,2}$/.test(s)) return s
  const mins = parseInt(s, 10)
  if (!isNaN(mins) && mins > 0) return mins >= 60 ? `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}:00` : `${mins}:00`
  return s
}
