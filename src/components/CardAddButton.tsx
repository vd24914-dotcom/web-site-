'use client'
import { useCart, roomFor } from '@/lib/cart'
import { isSaleActive } from '@/lib/sale'
import { useT } from '@/components/SiteText'
import { SiteIcon } from '@/components/SiteIcon'

interface Props {
  p: { id: number; slug: string; name: string; price: number; onSale?: boolean; salePrice?: number | null; saleEnd?: string | null; quantity?: number | null; inStock?: boolean }
  image?: string
}

/** Кнопка «В корзину» на карточке товара: без выбора цвета/размера, с учётом остатка */
export function CardAddButton({ p, image }: Props) {
  const t = useT()
  const { add, setOpen, lastAdded, items } = useCart()
  const stock = p.quantity != null ? Math.max(0, p.quantity) : null
  const room = roomFor(items, p.id, stock)
  const full = stock != null && room <= 0
  const justAdded = lastAdded?.startsWith(`${p.id}|`)

  const onClick = () => {
    if (full) { setOpen(true); return }
    add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, salePrice: isSaleActive(p) ? p.salePrice : null, image, maxQty: stock }, 1)
  }

  return (
    <button type="button" className={`pcard-add${justAdded ? ' added' : ''}${full ? ' full' : ''}`} onClick={onClick}>
      {justAdded ? <><SiteIcon k="icon_added" size={15} /> {t('card_added')}</> : full ? t('card_in_cart') : <><SiteIcon k="icon_add" size={15} /> {t('card_add')}</>}
    </button>
  )
}
