import { NextRequest, NextResponse } from 'next/server'

// Диагностика Telegram: показывает, какой токен/chat_id видит сайт,
// и что отвечает Telegram при отправке. Защищено секретом (?secret=JWT_SECRET).
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  const info: any = {
    hasToken: !!token,
    tokenPreview: token ? token.slice(0, 10) + '…' + token.slice(-4) : null,
    tokenLength: token ? token.length : 0,
    hasChatId: !!chatId,
    chatId: chatId || null,
  }

  if (!token || !chatId) {
    return NextResponse.json({ ...info, sent: false, reason: 'Нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в окружении' })
  }

  const send = async (method: string, payload: any) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...payload }),
    })
    return res.json().catch(() => ({ ok: false }))
  }

  try {
    // 1) Обычный текст
    const plain = await send('sendMessage', { text: '✅ Тест 1: обычный текст' })
    // 2) Текст с HTML-разметкой (как в заявке)
    const html = await send('sendMessage', {
      text: '🧶 <b>Тест 2: разметка</b>\n👤 <b>Имя:</b> Проверка',
      parse_mode: 'HTML',
    })
    // 3) Сообщение с фото по ссылке
    const photo = await send('sendPhoto', {
      photo: 'https://picsum.photos/seed/uyutnit/600/600',
      caption: '🖼 Тест 3: фото с подписью',
      parse_mode: 'HTML',
    })
    return NextResponse.json({ ...info, plain, html, photo })
  } catch (e: any) {
    return NextResponse.json({ ...info, error: e?.message || 'fetch error' })
  }
}
