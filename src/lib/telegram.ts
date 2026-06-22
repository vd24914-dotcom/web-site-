function botToken() {
  const t = process.env.TELEGRAM_BOT_TOKEN
  if (!t || t === 'your_bot_token_here') return null
  return t
}

async function tg(chatId: string | undefined, method: string, payload: any): Promise<any> {
  const t = botToken()
  if (!t || !chatId) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...payload }),
    })
    return await res.json().catch(() => ({ ok: res.ok }))
  } catch {
    return null
  }
}

const stripTags = (s: string) => s.replace(/<\/?[^>]+>/g, '')

// Текст в произвольный чат/канал. Если HTML-разметка отклонена — повтор обычным текстом.
async function send(chatId: string | undefined, text: string) {
  const r = await tg(chatId, 'sendMessage', { text, parse_mode: 'HTML' })
  if (!r || r.ok === false) await tg(chatId, 'sendMessage', { text: stripTags(text) })
}

// Фото с подписью. Если не прошло — отправляем текстом.
async function sendPhoto(chatId: string | undefined, photoUrl: string, caption: string) {
  const r = await tg(chatId, 'sendPhoto', { photo: photoUrl, caption, parse_mode: 'HTML' })
  if (!r || r.ok === false) await send(chatId, caption)
}

// ── Заявки → личный чат владельца ──
export const sendTelegram = (text: string) => send(process.env.TELEGRAM_CHAT_ID, text)
export const sendTelegramPhoto = (photoUrl: string, caption: string) =>
  sendPhoto(process.env.TELEGRAM_CHAT_ID, photoUrl, caption)

// ── Новости → Telegram-канал ──
export const sendChannel = (text: string) => send(process.env.TELEGRAM_CHANNEL_ID, text)
export const sendChannelPhoto = (photoUrl: string, caption: string) =>
  sendPhoto(process.env.TELEGRAM_CHANNEL_ID, photoUrl, caption)
