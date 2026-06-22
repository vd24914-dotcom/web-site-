import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegram, sendTelegramPhoto } from '@/lib/telegram'
import { parseJSON } from '@/lib/utils'

// Экранируем спецсимволы, чтобы Telegram (parse_mode HTML) не падал
const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req: NextRequest) {
  const { name, phone, email, message, productId } = await req.json()
  if (!name || !phone) return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 })

  let product: any = null
  if (productId) product = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null)

  const order = await prisma.order.create({
    data: { name, phone, email: email || null, message: message || '', productId: productId || null },
  }).catch(() => null)
  if (!order) return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  // Описание товара (укорачиваем, чтобы подпись под фото не была слишком длинной)
  const descRaw = product ? String(product.description || '') : ''
  const desc = descRaw.length > 400 ? descRaw.slice(0, 400) + '…' : descRaw
  const fmt = (n: number) => Number(n).toLocaleString('ru-RU') + ' сум'
  let price = ''
  if (product) {
    if (product.onSale && product.salePrice) {
      price = `${fmt(product.salePrice)} (по скидке, было ${fmt(product.price)})`
    } else {
      price = fmt(product.price)
    }
  }

  const caption = [
    '🧶 <b>Новая заявка — УютНить!</b>', '',
    product ? `🛍 <b>Товар:</b> ${esc(product.name)}` : '🛍 <b>Заявка:</b> Общая',
    product && desc ? `📝 ${esc(desc)}` : '',
    price ? `💰 <b>Цена:</b> ${esc(price)}` : '',
    '',
    `👤 <b>Имя:</b> ${esc(name)}`,
    `📱 <b>Телефон:</b> ${esc(phone)}`,
    email ? `✉️ <b>Почта:</b> ${esc(email)}` : '',
    message ? `💬 <b>Пожелания:</b> ${esc(message)}` : '',
    siteUrl ? `\n🔗 Админка: ${siteUrl}/admin/orders` : '',
  ].filter(Boolean).join('\n')

  // Фото товара — только публичная ссылка (http). Старые base64-фото Telegram не примет.
  let photo: string | null = null
  if (product) {
    const imgs = parseJSON(product.images || '[]')
    if (imgs[0] && typeof imgs[0] === 'string' && imgs[0].startsWith('http')) photo = imgs[0]
  }

  if (photo) await sendTelegramPhoto(photo, caption)
  else await sendTelegram(caption)

  return NextResponse.json({ success: true })
}
