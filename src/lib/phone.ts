// Узбекский номер: +998 XX XXX XX XX (9 цифр после кода 998)
export function formatUzPhone(input: string): string {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  d = d.slice(0, 9)
  let out = '+998'
  if (d.length) out += ' ' + d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}
export const uzDigits = (p: string) => p.replace(/\D/g, '')
export const isUzComplete = (p: string) => uzDigits(p).length === 12

/** Ник Telegram без @ и ссылок, только допустимые символы */
export const cleanTgUser = (v: string) =>
  v.replace(/^\s*@?/, '').replace(/^(https?:\/\/)?(t\.me|telegram\.me)\//i, '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 32)
