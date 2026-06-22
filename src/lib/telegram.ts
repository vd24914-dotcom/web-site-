function creds() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || token === 'your_bot_token_here' || !chatId) return null
  return { token, chatId }
}

async function tg(method: string, payload: any): Promise<any> {
  const c = creds()
  if (!c) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${c.token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c.chatId, ...payload }),
    })
    return await res.json().catch(() => ({ ok: res.ok }))
  } catch {
    return null
  }
}

const stripTags = (s: string) => s.replace(/<\/?[^>]+>/g, '')

// Текстовое сообщение. Если HTML-разметка по какой-то причине отклонена —
// повторяем обычным текстом, чтобы заявка точно дошла.
export async function sendTelegram(message: string) {
  const r = await tg('sendMessage', { text: message, parse_mode: 'HTML' })
  if (!r || r.ok === false) {
    await tg('sendMessage', { text: stripTags(message) })
  }
}

// Сообщение с фото. Если фото/подпись не прошли — отправляем текстом (с тем же запасным вариантом).
export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  const r = await tg('sendPhoto', { photo: photoUrl, caption, parse_mode: 'HTML' })
  if (!r || r.ok === false) {
    await sendTelegram(caption)
  }
}
