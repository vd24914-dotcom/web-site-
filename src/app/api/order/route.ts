import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegram, sendTelegramPhoto, sendTelegramAlbum } from '@/lib/telegram'
import { parseJSON } from '@/lib/utils'

// Экранируем спецсимволы, чтобы Telegram (parse_mode HTML) не падал
const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, message } = body
  let productId = body.productId
  // Заказ из корзины: список позиций; проверяем товары по базе, цены берём оттуда
  const rawItems: any[] = Array.isArray(body.items) ? body.items.slice(0, 50) : []
  if (!name || !phone) return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 })
  // В поле email теперь хранится Telegram-ник клиента, нормализуем к виду @username
  const tg = String(body.email || '').trim().replace(/^(https?:\/\/)?(t\.me|telegram\.me)\//i, '').replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 32)
  const email = tg ? `@${tg}` : ''

  let product: any = null
  let cart: { productId: number; name: string; qty: number; price: number; color: string; size: string; image: string }[] = []
  if (rawItems.length) {
    const ids = [...new Set(rawItems.map((i) => Number(i.productId)).filter(Boolean))]
    const found = await prisma.product.findMany({ where: { id: { in: ids } } }).catch(() => [])
    for (const i of rawItems) {
      const pr: any = (found as any[]).find((f) => f.id === Number(i.productId))
      if (!pr) continue
      const sale = pr.onSale && pr.salePrice && (!pr.saleEnd || new Date(pr.saleEnd).getTime() > Date.now())
      const imgs = parseJSON(pr.images || '[]')
      cart.push({ productId: pr.id, name: pr.name, qty: Math.min(99, pr.quantity != null ? Math.max(1, pr.quantity) : 99, Math.max(1, Number(i.qty) || 1)), price: sale ? pr.salePrice : pr.price,
        color: String(i.color || '').slice(0, 60), size: String(i.size || '').slice(0, 60), image: typeof imgs[0] === 'string' ? imgs[0] : '' })
    }
    if (!cart.length) return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
    productId = cart[0].productId
  }
  if (productId && !cart.length) product = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null)

  const fmt0 = (n: number) => Number(n).toLocaleString('ru-RU') + ' сум'
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartSummary = cart.length
    ? 'Состав заказа:\n' + cart.map((i, n) => `${n + 1}. ${i.name} × ${i.qty} — ${fmt0(i.price * i.qty)}${[i.color && 'цвет: ' + i.color, i.size && 'размер: ' + i.size].filter(Boolean).length ? ' (' + [i.color && 'цвет: ' + i.color, i.size && 'размер: ' + i.size].filter(Boolean).join(', ') + ')' : ''}`).join('\n') + `\nИтого: ${fmt0(cartTotal)}`
    : ''
  const adminMessage = [cartSummary, message ? (cart.length ? 'Пожелания: ' + message : message) : ''].filter(Boolean).join('\n\n')
  const order = await prisma.order.create({
    data: { name, phone, email: email || null, message: adminMessage, productId: productId || null, items: cart.length ? JSON.stringify(cart) : null } as any,
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

  const cartLines = cart.length
    ? [`🛒 <b>Заказ из корзины — ${cart.length} ${cart.length === 1 ? 'позиция' : cart.length < 5 ? 'позиции' : 'позиций'}:</b>`,
       ...cart.map((i, n) => `${n + 1}. ${esc(i.name)} × ${i.qty} — <b>${esc(fmt0(i.price * i.qty))}</b>${i.color || i.size ? ' <i>(' + esc([i.color && 'цвет: ' + i.color, i.size && 'размер: ' + i.size].filter(Boolean).join(', ')) + ')</i>' : ''}`),
       `💰 <b>Итого:</b> ${esc(fmt0(cartTotal))}`]
    : []
  const caption = [
    '🧶 <b>Новая заявка — Fimush.kin!</b>', '',
    ...cartLines,
    !cart.length ? (product ? `🛍 <b>Товар:</b> ${esc(product.name)}` : '🛍 <b>Заявка:</b> Общая') : '',
    !cart.length && product && desc ? `📝 ${esc(desc)}` : '',
    !cart.length && price ? `💰 <b>Цена:</b> ${esc(price)}` : '',
    '',
    `👤 <b>Имя:</b> ${esc(name)}`,
    `📱 <b>Телефон:</b> ${esc(phone)}`,
    email ? `✈️ <b>Telegram:</b> <a href="https://t.me/${esc(email.slice(1))}">${esc(email)}</a>` : '',
    message ? `💬 <b>Пожелания:</b> ${esc(message)}` : '',
    siteUrl ? `\n🔗 Админка: ${siteUrl}/admin/orders` : '',
  ].filter(Boolean).join('\n')

  // Фото товара — только публичная ссылка (http). Старые base64-фото Telegram не примет.
  let photo: string | null = null
  if (cart.length && cart[0].image && cart[0].image.startsWith('http')) photo = cart[0].image
  if (product) {
    const imgs = parseJSON(product.images || '[]')
    if (imgs[0] && typeof imgs[0] === 'string' && imgs[0].startsWith('http')) photo = imgs[0]
  }

  if (cart.length) {
    // Заказ из корзины: сначала полный текст заявки, затем альбом — фото каждой позиции с подписью
    await sendTelegram(caption)
    const media = cart.filter((i) => i.image && i.image.startsWith('http')).map((i, n) => ({
      url: i.image,
      caption: `${n + 1}. <b>${esc(i.name)}</b> × ${i.qty} — ${esc(fmt0(i.price * i.qty))}${i.color || i.size ? ' (' + esc([i.color && 'цвет: ' + i.color, i.size && 'размер: ' + i.size].filter(Boolean).join(', ')) + ')' : ''}`,
    }))
    if (media.length === 1) await sendTelegramPhoto(media[0].url, media[0].caption)
    else if (media.length > 1) await sendTelegramAlbum(media)
  } else if (photo) await sendTelegramPhoto(photo, caption)
  else await sendTelegram(caption)

  return NextResponse.json({ success: true })
}
