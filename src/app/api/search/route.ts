import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeQuery, searchProducts } from '@/lib/search'

// Публичный поиск по товарам для живых подсказок в шапке сайта
export async function GET(req: NextRequest) {
  const q = normalizeQuery(req.nextUrl.searchParams.get('q'))
  if (q.length < 2) return NextResponse.json({ items: [], q })

  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: { category: { select: { name: true, slug: true, emoji: true } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  }).catch(() => [])

  const found = searchProducts(products as any[], q)
  const items = found.slice(0, 8).map((p: any) => {
    let image: string | null = null
    try { image = JSON.parse(p.images || '[]')[0] || null } catch {}
    return {
      id: p.id, slug: p.slug, name: p.name, price: p.price, onSale: p.onSale, salePrice: p.salePrice,
      image, category: p.category?.name || '', emoji: p.category?.emoji || '🧶',
    }
  })

  return NextResponse.json({ items, q, total: found.length }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
