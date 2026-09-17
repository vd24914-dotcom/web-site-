import Link from 'next/link'
import { parseJSON } from '@/lib/utils'
import { PriceTag } from '@/components/PriceTag'
import { SaleBadge } from '@/components/SaleBadge'
import { RestockCountdown } from '@/components/RestockCountdown'

/** Карточка товара для блоков на главной («Популярные», «Товары на акции») */
export function ProductCard({ p }: { p: any }) {
  const imgs = parseJSON(p.images || '[]'); const img = imgs[0]
  return (
    <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card">
        <div style={{ aspectRatio: '1', background: img ? 'transparent' : 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden', position: 'relative' }}>
          {img
            ? <img src={img} alt={p.name} loading="lazy" decoding="async" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : p.category?.emoji || '🧶'
          }
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          {(p.featured || (p.onSale && p.salePrice)) && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {p.featured && <span className="badge badge-hit">✨ Новинка</span>}
              <SaleBadge price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
            </div>
          )}
          <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
          <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
            {p.restockAt
              ? <RestockCountdown at={p.restockAt} qty={p.restockQty} mini />
              : <span style={{ fontSize: '.78rem', color: p.inStock ? '#2e7d45' : '#e53e3e', fontWeight: 600 }}>{p.inStock ? '✓ В наличии' : 'Под заказ'}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
