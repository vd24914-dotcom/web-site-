'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { isSaleActive, saleEndTime } from '@/lib/sale'

interface Props {
  price: number
  onSale?: boolean
  salePrice?: number | null
  saleEnd?: string | null
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Цена товара. Если акция активна — новая цена и зачёркнутая старая.
 * Следит за сроком акции: в момент окончания сам переключается на обычную цену,
 * даже если страница отдана из кеша.
 */
export function PriceTag({ price, onSale, salePrice, saleEnd, size = 'md' }: Props) {
  const p = { price, onSale, salePrice, saleEnd }
  const [active, setActive] = useState(() => isSaleActive(p))

  useEffect(() => {
    setActive(isSaleActive(p))
    const end = saleEndTime(p)
    if (!end || !isSaleActive(p)) return
    const t = setTimeout(() => setActive(false), Math.min(end - Date.now() + 200, 2_147_000_000))
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, onSale, salePrice, saleEnd])

  const mainSize = size === 'lg' ? '1.9rem' : size === 'sm' ? '1.05rem' : '1.15rem'
  const oldSize = size === 'lg' ? '1.1rem' : '.82rem'

  if (active) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="font-display" style={{ fontSize: mainSize, color: 'var(--pink)', fontWeight: 700 }}>
          {formatPrice(salePrice as number)}
        </span>
        <span style={{ fontSize: oldSize, color: 'var(--text-sub)', textDecoration: 'line-through' }}>
          {formatPrice(price)}
        </span>
      </span>
    )
  }

  return (
    <span className="font-display" style={{ fontSize: mainSize, color: 'var(--pink)', fontWeight: 700 }}>
      {formatPrice(price)}
    </span>
  )
}
