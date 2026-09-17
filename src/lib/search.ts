// Поиск по товарам: простое сопоставление по словам, без учёта регистра.
// Работает одинаково на SQLite и Postgres, корректно с кириллицей.

export function normalizeQuery(q: string | undefined | null): string {
  return (q || '').trim().replace(/\s+/g, ' ').slice(0, 80)
}

function tokens(q: string): string[] {
  return normalizeQuery(q).toLowerCase().split(' ').filter(Boolean)
}

/** Собирает текст, по которому ищем: название, описание, категория, цвета, размеры */
export function productHaystack(p: any): string {
  let extra = ''
  try { extra += ' ' + JSON.parse(p.colors || '[]').join(' ') } catch {}
  try { extra += ' ' + JSON.parse(p.sizes || '[]').join(' ') } catch {}
  return [p.name, p.description, p.category?.name, p.metaTitle, p.metaDesc, extra].filter(Boolean).join(' ').toLowerCase()
}

/** Все слова запроса должны встречаться в тексте товара */
export function matchProduct(p: any, q: string): boolean {
  const t = tokens(q)
  if (t.length === 0) return true
  const hay = productHaystack(p)
  return t.every((w) => hay.includes(w))
}

/** Оценка релевантности: совпадение в названии важнее, чем в описании */
export function scoreProduct(p: any, q: string): number {
  const t = tokens(q)
  const name = String(p.name || '').toLowerCase()
  let score = 0
  for (const w of t) {
    if (name.startsWith(w)) score += 6
    else if (name.includes(w)) score += 4
    else if (String(p.category?.name || '').toLowerCase().includes(w)) score += 2
    else score += 1
  }
  if (p.featured) score += 0.5
  return score
}

export function searchProducts<T>(products: T[], q: string, limit?: number): T[] {
  const nq = normalizeQuery(q)
  if (!nq) return limit ? products.slice(0, limit) : products
  const res = products
    .filter((p) => matchProduct(p, nq))
    .map((p) => ({ p, s: scoreProduct(p, nq) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p)
  return limit ? res.slice(0, limit) : res
}
