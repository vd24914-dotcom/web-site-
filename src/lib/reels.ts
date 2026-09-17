// Работа со ссылками на Instagram Reels
// Ссылки хранятся в SiteSettings под ключом `reels` как JSON-массив строк.

export const REELS_KEY = 'reels'

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

/** Парсит значение из настроек в список кодов рилсов */
export function parseReels(raw: string | undefined | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map((x) => parseReelId(String(x))).filter((x): x is string => !!x)
  } catch {
    return []
  }
}
