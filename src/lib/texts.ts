// Тексты сайта по умолчанию. Источник — реестр контента (src/lib/content.ts),
// там же подписи для админки. Значения из админки (SiteSettings) имеют приоритет.
import { DEFAULTS } from '@/lib/content'

export const TEXTS: Record<string, string> = DEFAULTS
export type TextKey = string
