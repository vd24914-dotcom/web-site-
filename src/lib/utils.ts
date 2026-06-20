export function cn(...c: any[]) { return c.filter(Boolean).join(' ') }
export function formatPrice(p: number) {
  return new Intl.NumberFormat('uz-UZ').format(p) + ' so\'m'
}
export function parseJSON(s: string, fb: any = []) {
  try { return JSON.parse(s) } catch { return fb }
}
