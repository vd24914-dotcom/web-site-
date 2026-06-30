import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await prisma.order.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ orders })
}
export async function PATCH(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  const order = await prisma.order.update({ where: { id }, data: { status } })
  return NextResponse.json({ order })
}
export async function DELETE(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = parseInt(new URL(req.url).searchParams.get('id') || '0')
  await prisma.order.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ success: true })
}
