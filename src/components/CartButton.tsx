'use client'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'

/** Кнопка корзины для шапки: иконка и счётчик позиций, открывает панель корзины */
export function CartButton({ label = false }: { label?: boolean }) {
  const { count, setOpen } = useCart()
  return (
    <button type="button" onClick={() => setOpen(true)} className={`cart-btn${label ? ' with-label' : ''}`} aria-label={`Корзина, товаров: ${count}`}>
      <ShoppingBag size={18} aria-hidden="true" />
      {label && <span>Корзина</span>}
      {count > 0 && <span className="cart-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
    </button>
  )
}
