function creds() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || token === 'your_bot_token_here' || !chatId) return null
  return { token, chatId }
}

// Обычное текстовое сообщение
export async function sendTelegram(message: string) {
  const c = creds()
  if (!c) return
  try {
    await fetch(`https://api.telegram.org/bot${c.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c.chatId, text: message, parse_mode: 'HTML' }),
    })
  } catch {}
}

// Сообщение с фотографией товара (caption — подпись под фото)
export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  const c = creds()
  if (!c) return
  try {
    const res = await fetch(`https://api.telegram.org/bot${c.token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c.chatId, photo: photoUrl, caption, parse_mode: 'HTML' }),
    })
    // Если фото не отправилось (например, ссылка недоступна) — шлём текстом
    if (!res.ok) await sendTelegram(caption)
  } catch {
    await sendTelegram(caption)
  }
}
