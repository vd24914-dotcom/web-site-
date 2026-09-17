import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isSaleExpired } from '@/lib/sale'

async function auth() {
  if (!await getSession()) return false
  return true
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } })

  // Акции с истёкшим сроком автоматически выключаем в базе,
  // чтобы они не «висели» ни в админке, ни на сайте
  const expired = products.filter((p: any) => isSaleExpired(p))
  if (expired.length) {
    await prisma.product.updateMany({
      where: { id: { in: expired.map((p: any) => p.id) } },
      data: { onSale: false, saleEnd: null },
    })
    products = products.map((p: any) => expired.some((e: any) => e.id === p.id) ? { ...p, onSale: false, saleEnd: null } : p)
    revalidatePath('/'); revalidatePath('/catalog'); revalidatePath('/sale'); revalidatePath('/product/[slug]', 'page')
  }

  return NextResponse.json({ products, expiredSales: expired.map((p: any) => p.name) })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const slugify = (await import('slugify')).default
  const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now()
  const product = await prisma.product.create({
    data: {
      name: data.name, slug,
      description: data.description,
      price: parseFloat(data.price),
      onSale: !!data.onSale,
      salePrice: data.onSale && data.salePrice ? parseFloat(data.salePrice) : null,
      saleEnd: data.onSale && data.saleEnd ? data.saleEnd : null,
      categoryId: parseInt(data.categoryId),
      images: JSON.stringify(data.images || []),
      colors: JSON.stringify(data.colors || []),
      sizes: JSON.stringify(data.sizes || []),
      inStock: data.inStock ?? true,
      quantity: (data.quantity === '' || data.quantity == null) ? null : parseInt(data.quantity),
      restockAt: data.restockAt || null,
      restockQty: (data.restockQty === '' || data.restockQty == null) ? null : parseInt(data.restockQty),
      featured: data.featured ?? false,
      metaTitle: data.metaTitle || null,
      metaDesc: data.metaDesc || null,
      videoUrl: data.videoUrl || null,
    }
  })
  revalidatePath('/')
  revalidatePath('/catalog')
  return NextResponse.json({ product })
}

// Быстрое изменение одного флага из списка товаров (например, «Популярное»)
export async function PATCH(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const id = parseInt(data.id)
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 400 })
  const patch: Record<string, any> = {}
  if (typeof data.featured === 'boolean') patch.featured = data.featured
  if (typeof data.inStock === 'boolean') patch.inStock = data.inStock
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Нечего менять' }, { status: 400 })
  const product = await prisma.product.update({ where: { id }, data: patch })
  revalidatePath('/')
  revalidatePath('/catalog')
  revalidatePath('/sale')
  revalidatePath('/product/[slug]', 'page')
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const product = await prisma.product.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      onSale: !!data.onSale,
      salePrice: data.onSale && data.salePrice ? parseFloat(data.salePrice) : null,
      saleEnd: data.onSale && data.saleEnd ? data.saleEnd : null,
      categoryId: parseInt(data.categoryId),
      images: JSON.stringify(data.images || []),
      colors: JSON.stringify(data.colors || []),
      sizes: JSON.stringify(data.sizes || []),
      inStock: data.inStock ?? true,
      quantity: (data.quantity === '' || data.quantity == null) ? null : parseInt(data.quantity),
      restockAt: data.restockAt || null,
      restockQty: (data.restockQty === '' || data.restockQty == null) ? null : parseInt(data.restockQty),
      featured: data.featured ?? false,
      metaTitle: data.metaTitle || null,
      metaDesc: data.metaDesc || null,
      videoUrl: data.videoUrl || null,
    }
  })
  revalidatePath('/')
  revalidatePath('/catalog')
  revalidatePath(`/product/${product.slug}`)
  return NextResponse.json({ product })
}

export async function DELETE(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '0')
  await prisma.product.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/catalog')
  return NextResponse.json({ success: true })
}
