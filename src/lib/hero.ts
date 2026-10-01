// Первый блок главной (CommerceHero): меню, кнопка и выбор категорий.
// Всё хранится в SiteSettings и редактируется в админке → Дизайн и контент → Первый блок.

export interface HeroNavItem { name: string; href: string }

export const DEFAULT_HERO_NAV: HeroNavItem[] = [
  { name: 'Каталог', href: '/catalog' },
  { name: 'Скидки', href: '/sale' },
  { name: 'Новости', href: '/news' },
  { name: 'О нас', href: '/#about' },
  { name: 'Контакты', href: '/#contact' },
]

/** Пункты меню из настройки `hero_nav` (JSON). Пустая или битая строка → меню по умолчанию. */
export function parseHeroNav(raw?: string): HeroNavItem[] {
  if (!raw) return DEFAULT_HERO_NAV
  try {
    const list = JSON.parse(raw)
    if (Array.isArray(list)) {
      const items = list
        .filter((x) => x && typeof x.name === 'string' && typeof x.href === 'string' && x.name.trim())
        .map((x) => ({ name: String(x.name).trim(), href: String(x.href).trim() || '#' }))
      if (items.length) return items
    }
  } catch {}
  return DEFAULT_HERO_NAV
}

export function serializeHeroNav(items: HeroNavItem[]): string {
  return JSON.stringify(items.map((i) => ({ name: i.name.trim(), href: i.href.trim() })))
}

/**
 * Категории для карточек первого блока. `raw` — слаги через запятую в том порядке,
 * в каком их отметили в админке. Если ничего не выбрано — первые `limit` по порядку сортировки.
 */
export function pickHeroCategories<T extends { slug: string }>(all: T[], raw?: string, limit = 4): T[] {
  const slugs = (raw || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (slugs.length) {
    const picked = slugs.map((s) => all.find((c) => c.slug === s)).filter(Boolean) as T[]
    if (picked.length) return picked.slice(0, 8)
  }
  return all.slice(0, limit)
}
