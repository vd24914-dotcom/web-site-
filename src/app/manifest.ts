import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  const s = Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
  const name = s.site_name || 'Fimush.kin'

  return {
    name: `${name} — вязаные изделия ручной работы`,
    short_name: name,
    description: 'Вязаные изделия ручной работы. Каталог, заказы и новости.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF3E6',
    theme_color: '#FA87A1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
