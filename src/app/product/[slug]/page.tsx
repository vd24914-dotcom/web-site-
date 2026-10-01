export const revalidate = 3600
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { parseJSON } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductView } from '@/components/ProductView'

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await prisma.product.findUnique({ where: { slug } }).catch(() => null)
  if (!p) return { title: 'Товар не найден' }
  const imgs = parseJSON((p as any).images || '[]')
  return {
    title: (p as any).metaTitle || p.name,
    description: (p as any).metaDesc || p.description.slice(0, 160),
    openGraph: { title: p.name, images: imgs[0] ? [{ url: imgs[0] }] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, include: { category: true } }).catch(() => null),
    getSettings(),
  ])
  if (!product) notFound()

  return (
    <>
      <Header settings={settings} />
      <main>
        <ProductView p={product} settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  )
}
