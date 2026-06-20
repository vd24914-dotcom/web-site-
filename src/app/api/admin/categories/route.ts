import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ categories: cats })
}
export async function POST(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, emoji, sortOrder } = await req.json()
  const slugify = (await import('slugify')).default
  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now()
  const cat = await prisma.category.create({ data: { name, slug, emoji: emoji||'🧶', sortOrder: sortOrder||0 } })
  return NextResponse.json({ category: cat })
}
export async function DELETE(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  await prisma.category.delete({ where: { id: parseInt(searchParams.get('id')||'0') } })
  return NextResponse.json({ success: true })
}
