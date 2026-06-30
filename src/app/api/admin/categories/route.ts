import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ categories: cats })
}

export async function POST(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, emoji, icon, sortOrder } = await req.json()
  const slugify = (await import('slugify')).default
  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now()
  const cat = await prisma.category.create({
    data: { name, slug, emoji: emoji || '🧶', icon: icon || null, sortOrder: sortOrder || 0 },
  })
  revalidatePath('/'); revalidatePath('/catalog')
  return NextResponse.json({ category: cat })
}

export async function PUT(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, emoji, icon, sortOrder } = await req.json()
  const cat = await prisma.category.update({
    where: { id },
    data: { name, emoji: emoji || '🧶', icon: icon || null, sortOrder: sortOrder || 0 },
  })
  revalidatePath('/'); revalidatePath('/catalog')
  return NextResponse.json({ category: cat })
}

export async function DELETE(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  await prisma.category.delete({ where: { id: parseInt(searchParams.get('id') || '0') } }).catch(() => {})
  revalidatePath('/'); revalidatePath('/catalog')
  return NextResponse.json({ success: true })
}
