import { formatPrice } from '@/lib/utils'

interface Props {
  price: number
  onSale?: boolean
  salePrice?: number | null
  size?: 'sm' | 'md' | 'lg'
}

// Цена товара. Если товар на скидке — показывает новую цену и зачёркнутую старую.
export function PriceTag({ price, onSale, salePrice, size = 'md' }: Props) {
  const sale = !!onSale && salePrice != null && salePrice < price
  const mainSize = size === 'lg' ? '1.9rem' : size === 'sm' ? '1.05rem' : '1.15rem'
  const oldSize = size === 'lg' ? '1.1rem' : '.82rem'

  if (sale) {
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
