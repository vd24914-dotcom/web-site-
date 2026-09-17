// Единая логика «акция активна?» для сайта, поиска и админки.
// Дата окончания хранится строкой из поля datetime-local («2026-09-20T18:00»),
// без часового пояса — трактуем её как время Ташкента (UTC+5), чтобы сервер
// (UTC на Vercel) и браузер считали одинаково.

export const SALE_TZ_OFFSET = '+05:00'

/** Разбирает дату; строке без пояса добавляет пояс Ташкента */
export function parseLocalDate(value: string | null | undefined): number | null {
  if (!value) return null
  const s = String(value).trim()
  if (!s) return null
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/i.test(s)
  const iso = hasTz ? s : (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00${SALE_TZ_OFFSET}` : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s) ? `${s}${SALE_TZ_OFFSET}` : s)
  const t = new Date(iso).getTime()
  return isNaN(t) ? null : t
}

export interface SaleLike {
  price?: number | null
  onSale?: boolean | null
  salePrice?: number | null
  saleEnd?: string | null
}

/** Момент окончания акции (мс) или null, если бессрочная / не задана */
export function saleEndTime(p: SaleLike): number | null {
  return parseLocalDate(p.saleEnd)
}

/** Акция включена, цена по акции задана и ниже обычной, срок не истёк */
export function isSaleActive(p: SaleLike, now: number = Date.now()): boolean {
  if (!p.onSale || p.salePrice == null) return false
  if (p.price != null && !(p.salePrice < p.price)) return false
  const end = saleEndTime(p)
  if (end !== null && end <= now) return false
  return true
}

/** Акция была включена, но срок уже вышел */
export function isSaleExpired(p: SaleLike, now: number = Date.now()): boolean {
  if (!p.onSale) return false
  const end = saleEndTime(p)
  return end !== null && end <= now
}
