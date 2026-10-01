import Link from 'next/link'
import { ArrowUpRight, Zap } from 'lucide-react'
import { OrderModal } from '@/components/OrderModal'
import { parseJSON } from '@/lib/utils'
import { PriceTag } from '@/components/PriceTag'
import { SaleBadge } from '@/components/SaleBadge'
import { RestockCountdown } from '@/components/RestockCountdown'

interface Props {
  p: any
  /** Показывать короткое описание (каталог) */
  showDescription?: boolean
}

/**
 * Карточка товара — одна на главную, каталог и страницу скидок.
 * Стеклянная плашка поверх градиентного фона: фото в рамке с мягким скруглением,
 * пилюли «Новинка» и «−N%» на фото, категория, название, цена и наличие.
 * Стили — `.pcard*` в globals.css (hover только на устройствах с курсором,
 * без движения при prefers-reduced-motion).
 */
export function ProductCard({ p, showDescription = false }: Props) {
  const imgs = parseJSON(p.images || '[]')
  const img = imgs[0]
  return (
    <div className="pcard">
      <Link href={`/product/${p.slug}`} className="pcard-media" aria-label={p.name}>
        <div className="pcard-img">
          {img
            ? <img src={img} alt={p.name} loading="lazy" decoding="async" className="pcard-photo" />
            : <span className="pcard-emoji" aria-hidden="true">{p.category?.emoji || '🧶'}</span>}
        </div>
        {(p.featured || (p.onSale && p.salePrice)) && (
          <div className="pcard-badges">
            {p.featured && <span className="pill pill-ink">Новинка</span>}
            <SaleBadge price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
          </div>
        )}
        <span className="pcard-go" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="pcard-body">
        {p.category?.name && <div className="pcard-cat">{p.category.name}</div>}
        <h3 className="pcard-name"><Link href={`/product/${p.slug}`}>{p.name}</Link></h3>
        {showDescription && p.description && <p className="pcard-desc">{p.description}</p>}
        <div className="pcard-foot">
          <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
          {p.restockAt
            ? <RestockCountdown at={p.restockAt} qty={p.restockQty} mini />
            : <span className={`pcard-stock ${p.inStock ? 'in' : 'out'}`}><i aria-hidden="true" />{p.inStock ? 'В наличии' : 'Под заказ'}</span>}
        </div>
        <OrderModal productId={p.id} productName={p.name} trigger={
          <button type="button" className="pcard-buy"><Zap size={15} aria-hidden="true" /> Купить в 1 клик</button>
        } />
      </div>
    </div>
  )
}
