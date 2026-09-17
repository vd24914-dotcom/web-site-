'use client'
import { useEffect, useState } from 'react'
import { isSaleActive, saleEndTime } from '@/lib/sale'
import { SaleCountdown } from '@/components/SaleCountdown'

interface Props {
  price: number
  onSale?: boolean
  salePrice?: number | null
  saleEnd?: string | null
}

/** Бейдж «Скидка» + мини-таймер. Исчезает сам в момент окончания акции. */
export function SaleBadge({ price, onSale, salePrice, saleEnd }: Props) {
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

  if (!active) return null
  return (
    <>
      <span className="badge badge-sale">🏷 Скидка</span>
      {saleEnd && <SaleCountdown end={saleEnd} mini />}
    </>
  )
}
