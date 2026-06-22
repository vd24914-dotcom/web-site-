import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJSON } from '@/lib/utils'

// Диагностика Telegram: проверяет реальный сценарий заявки
// (текст с разметкой + фото товара). Защищено ?secret=JWT_SECRET.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  const info: any = {
    hasToken: !!token,
    hasChatId: !!chatId,
    chatId: chatId || null,
  }
  if (!token || !chatId) {
    return NextResponse.json({ ...info, reason: 'Нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID' })
  }

  // Берём первый товар с фото, чтобы проверить реальную ссылку
  const product: any = await prisma.product.findFirst({ orderBy: { id: 'desc' } }).catch(() => null)
  const imgs = product ? parseJSON(product.images || '[]') : []
  const photoUrl = imgs[0] && typeof imgs[0] === 'string' ? imgs[0] : null

  const send = async (method: string, payload: any) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...payload }),
    })
    return res.json().catch(() => ({ ok: false, status: res.status }))
  }

  try {
    const html = await send('sendMessage', {
      text: '🧶 <b>Тест заявки</b>\n👤 <b>Имя:</b> Проверка\n📱 <b>Телефон:</b> +998',
      parse_mode: 'HTML',
    })

    let photo: any = { skipped: 'у товара нет фото или нет товара' }
    if (photoUrl) {
      photo = await send('sendPhoto', {
        photo: photoUrl,
        caption: '🖼 Тест фото товара',
        parse_mode: 'HTML',
      })
    }

    return NextResponse.json({
      ...info,
      productName: product?.name || null,
      photoUrlType: photoUrl ? (photoUrl.startsWith('http') ? 'http-ссылка' : 'base64/иное') : 'нет',
      photoUrlStart: photoUrl ? String(photoUrl).slice(0, 60) : null,
      html,
      photo,
    })
  } catch (e: any) {
    return NextResponse.json({ ...info, error: e?.message || 'fetch error' })
  }
}
