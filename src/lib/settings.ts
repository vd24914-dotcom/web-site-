import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/** Все настройки сайта (тексты, картинки, контакты). Один запрос к базе на рендер. */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
})
