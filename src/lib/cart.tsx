'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Корзина живёт в браузере (localStorage), сервер её не хранит: заказ
 * отправляется одним запросом в /api/order со списком позиций.
 */
export interface CartItem {
  key: string
  productId: number
  slug: string
  name: string
  price: number
  /** Цена со скидкой, если акция активна в момент добавления */
  salePrice?: number | null
  image?: string
  color?: string
  size?: string
  qty: number
  /** Остаток на складе; null — без ограничения */
  maxQty?: number | null
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  open: boolean
  setOpen: (v: boolean) => void
  add: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  /** Товар только что добавлен — для короткой подсветки кнопки */
  lastAdded: string | null
}

const STORAGE = 'fimushkin_cart_v1'
const CartContext = createContext<CartContextValue | null>(null)

export const itemKey = (productId: number, color?: string, size?: string) => `${productId}|${color || ''}|${size || ''}`
/** Сколько ещё можно добавить этого товара с учётом всех его вариантов в корзине */
export const roomFor = (items: CartItem[], productId: number, maxQty: number | null | undefined, exceptKey?: string) => {
  if (maxQty == null) return 99
  const used = items.filter(i => i.productId === productId && i.key !== exceptKey).reduce((n, i) => n + i.qty, 0)
  return Math.max(0, maxQty - used)
}
export const unitPrice = (i: CartItem) => (i.salePrice != null && i.salePrice > 0 && i.salePrice < i.price ? i.salePrice : i.price)

const x0 = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setItems(parsed) }
    } catch {}
    setReady(true)
  }, [])
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(STORAGE, JSON.stringify(items)) } catch {}
  }, [items, ready])

  const add = useCallback<CartContextValue['add']>((item, qty = 1) => {
    const key = itemKey(item.productId, item.color, item.size)
    setItems(prev => {
      const i = prev.findIndex(x => x.key === key)
      const room = roomFor(prev, item.productId, item.maxQty, key)
      if (i >= 0) {
        const next = Math.min(99, room, x0(prev[i].qty) + qty)
        return next > 0 ? prev.map((x, j) => j === i ? { ...x, maxQty: item.maxQty, qty: next } : x) : prev.filter((_, j) => j !== i)
      }
      if (room <= 0) return prev
      return [...prev, { ...item, key, qty: Math.min(qty, room) }]
    })
    setLastAdded(key)
    setTimeout(() => setLastAdded(null), 1600)
  }, [])
  const setQty = useCallback((key: string, qty: number) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(x => x.key !== key)
      return prev.map(x => x.key === key ? { ...x, qty: Math.min(99, roomFor(prev, x.productId, x.maxQty, key), qty) } : x).filter(x => x.qty > 0)
    })
  }, [])
  const remove = useCallback((key: string) => setItems(prev => prev.filter(x => x.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + unitPrice(i) * i.qty, 0),
    open, setOpen, add, setQty, remove, clear, lastAdded,
  }), [items, open, add, setQty, remove, clear, lastAdded])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart вне CartProvider')
  return ctx
}
