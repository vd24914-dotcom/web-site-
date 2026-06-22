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

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '✅ Тест с сайта: бот подключён' }),
    })
    const data = await res.json()
    return NextResponse.json({ ...info, telegram: data })
  } catch (e: any) {
    return NextResponse.json({ ...info, error: e?.message || 'fetch error' })
  }
}
