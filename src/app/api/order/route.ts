import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegram } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { name, phone, message, productId } = await req.json()
  if (!name || !phone) return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 })

  let product = null
  if (productId) product = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null)

  const order = await prisma.order.create({
    data: { name, phone, message: message || '', productId: productId || null }
  }).catch(() => null)

  if (!order) return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 })

  await sendTelegram([
    '🧶 <b>Новая заявка — УютНить!</b>', '',
    `👤 <b>Имя:</b> ${name}`,
    `📱 <b>Телефон:</b> ${phone}`,
    product ? `🛍 <b>Товар:</b> ${(product as any).name}` : '🛍 <b>Товар:</b> Общая заявка',
    message ? `💬 <b>Пожелания:</b> ${message}` : '',
    '', `🔗 Посмотреть в админке: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders`,
  ].filter(Boolean).join('\n'))

  return NextResponse.json({ success: true })
}
