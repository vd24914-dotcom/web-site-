import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } }).catch(() => [])
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/catalog`, lastModified: new Date(), priority: 0.9 },
    ...(products as any[]).map((p: any) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
  ]
}
