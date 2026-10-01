import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function refreshAll() {
  revalidatePath('/'); revalidatePath('/catalog'); revalidatePath('/sale'); revalidatePath('/product/[slug]', 'page')
}

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ categories: cats })
}

export async function POST(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, emoji, icon, sortOrder } = await req.json()
  if (!String(name || '').trim()) return NextResponse.json({ error: 'Нет названия' }, { status: 400 })
  const slugify = (await import('slugify')).default
  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now()
  const cat = await prisma.category.create({
    data: { name, slug, emoji: emoji || '🧶', icon: icon || null, sortOrder: sortOrder || 0 },
  })
  refreshAll()
  return NextResponse.json({ category: cat })
}

export async function PUT(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, emoji, icon, sortOrder } = await req.json()
  if (!String(name || '').trim()) return NextResponse.json({ error: 'Нет названия' }, { status: 400 })
  const cat = await prisma.category.update({
    where: { id },
    data: { name, emoji: emoji || '🧶', icon: icon || null, sortOrder: sortOrder || 0 },
  }).catch(() => null)
  if (!cat) return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 })
  refreshAll()
  return NextResponse.json({ category: cat })
}

export async function DELETE(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '0')
  const used = await prisma.product.count({ where: { categoryId: id } })
  if (used > 0) return NextResponse.json({ error: `В категории есть товары (${used}). Сначала перенесите их в другую категорию` }, { status: 409 })
  const ok = await prisma.category.delete({ where: { id } }).then(() => true).catch(() => false)
  if (!ok) return NextResponse.json({ error: 'Не удалось удалить категорию' }, { status: 500 })
  refreshAll()
  return NextResponse.json({ success: true })
}
