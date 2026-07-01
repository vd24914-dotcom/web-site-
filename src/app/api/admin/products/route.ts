import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function auth() {
  if (!await getSession()) return false
  return true
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ products })
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
      categoryId: parseInt(data.categoryId),
      images: JSON.stringify(data.images || []),
      colors: JSON.stringify(data.colors || []),
      sizes: JSON.stringify(data.sizes || []),
      inStock: data.inStock ?? true,
      quantity: (data.quantity === '' || data.quantity == null) ? null : parseInt(data.quantity),
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
      categoryId: parseInt(data.categoryId),
      images: JSON.stringify(data.images || []),
      colors: JSON.stringify(data.colors || []),
      sizes: JSON.stringify(data.sizes || []),
      inStock: data.inStock ?? true,
      quantity: (data.quantity === '' || data.quantity == null) ? null : parseInt(data.quantity),
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
