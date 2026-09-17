// Работа со ссылками на Instagram Reels
// Список хранится в SiteSettings под ключом `reels` как JSON-массив
// объектов { id, cover } (cover — загруженная обложка, необязательна).
// Старый формат — массив строк-кодов — тоже читается.

export const REELS_KEY = 'reels'

export interface Reel {
  id: string
  cover?: string
}

/** Достаёт код рилса из любой ссылки вида instagram.com/reel/XXXX, /reels/XXXX или /p/XXXX */
export function parseReelId(input: string): string | null {
  const s = (input || '').trim()
  if (!s) return null
  const m = s.match(/instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i)
  if (m) return m[1]
  // Пользователь мог вставить только код
  if (/^[A-Za-z0-9_-]{5,}$/.test(s)) return s
  return null
}

export function reelUrl(id: string) {
  return `https://www.instagram.com/reel/${id}/`
}

export function reelEmbedUrl(id: string) {
  return `https://www.instagram.com/reel/${id}/embed/`
}

/** Парсит значение из настроек в список рилсов */
export function parseReels(raw: string | undefined | null): Reel[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    const out: Reel[] = []
    for (const item of arr) {
      if (typeof item === 'string') {
        const id = parseReelId(item)
        if (id) out.push({ id })
      } else if (item && typeof item === 'object') {
        const id = parseReelId(String(item.id || ''))
        if (id) out.push({ id, cover: item.cover ? String(item.cover) : undefined })
      }
    }
    return out
  } catch {
    return []
  }
}

export function serializeReels(list: Reel[]): string {
  return list.length ? JSON.stringify(list.map((r) => (r.cover ? { id: r.id, cover: r.cover } : { id: r.id }))) : ''
}
