'use client'
import { useState } from 'react'
import { ShoppingBag, Zap, Check, Minus, Plus } from 'lucide-react'
import { useCart, roomFor } from '@/lib/cart'
import { isSaleActive } from '@/lib/sale'
import { PriceTag } from '@/components/PriceTag'
import { SaleCountdown } from '@/components/SaleCountdown'
import { OrderModal } from '@/components/OrderModal'

export interface BuyProduct {
  id: number
  slug: string
  name: string
  price: number
  onSale?: boolean
  salePrice?: number | null
  saleEnd?: string | null
  image?: string
  colors: string[]
  sizes: string[]
  inStock: boolean
  /** Остаток на складе (null — не ограничен) */
  quantity?: number | null
}

/** Подбор цвета по названию для кружка-свотча; незнакомые цвета — без кружка */
const SWATCH: Record<string, string> = {
  'красный': '#c0392b', 'чёрный': '#1b1b1b', 'черный': '#1b1b1b', 'белый': '#ffffff', 'молочный': '#f6f1e7', 'бежевый': '#d9c3a5',
  'розовый': '#f4a6bd', 'серый': '#9a9a9a', 'синий': '#2f4f8f', 'голубой': '#8fc1e3', 'зелёный': '#3f8f5a', 'зеленый': '#3f8f5a',
  'салатовый': '#9bd35b', 'коричневый': '#6b4a2b', 'жёлтый': '#f3c84b', 'желтый': '#f3c84b', 'оранжевый': '#f08a3c', 'фиолетовый': '#7a4fb8',
  'сиреневый': '#b28fce', 'бирюзовый': '#3fb6a8', 'бордовый': '#7b1e3a', 'шоколадный': '#4a2c1a', 'какао': '#6b4a2b',
}
const swatchFor = (name: string) => {
  const n = name.toLowerCase().trim()
  for (const key of Object.keys(SWATCH)) if (n.includes(key)) return SWATCH[key]
  return null
}

/** Блок покупки на странице товара: цвет, размер, количество, цена, «В корзину» и «Купить в 1 клик» */
export function ProductBuy({ product, settings }: { product: BuyProduct; settings: Record<string, string> }) {
  const { add, setOpen, lastAdded, items } = useCart()
  const [color, setColor] = useState<string>(product.colors[0] || '')
  const [size, setSize] = useState<string>(product.sizes[0] || '')
  const [qty, setQty] = useState(1)
  const saleOn = isSaleActive(product)
  const justAdded = lastAdded?.startsWith(`${product.id}|`)
  const stock = product.quantity != null ? Math.max(0, product.quantity) : null
  const room = roomFor(items, product.id, stock)
  const maxPick = stock == null ? 99 : Math.max(1, room)
  const soldOut = stock != null && room <= 0

  const addToCart = () => {
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, salePrice: saleOn ? product.salePrice : null, image: product.image, color: color || undefined, size: size || undefined, maxQty: stock }, Math.min(qty, maxPick))
  }
  const note = [color && `Цвет: ${color}`, size && `Размер: ${size}`, qty > 1 && `Количество: ${qty}`].filter(Boolean).join(', ')

  return (
    <div className="pp-buy">
      {product.colors.length > 0 && (
        <div className="pp-opt">
          <div className="pp-opt-label">Цвет: <b>{color}</b></div>
          <div className="pp-chips">
            {product.colors.map(c => {
              const sw = swatchFor(c)
              return (
                <button key={c} type="button" className={`chip${color === c ? ' on' : ''}`} onClick={() => setColor(c)} aria-pressed={color === c}>
                  {sw && <i className="chip-dot" style={{ background: sw, borderColor: sw === '#ffffff' ? '#ddd' : sw }} aria-hidden="true" />}
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {product.sizes.length > 0 && (
        <div className="pp-opt">
          <div className="pp-opt-label">Размер: <b>{size}</b></div>
          <div className="pp-chips">
            {product.sizes.map(s => (
              <button key={s} type="button" className={`chip${size === s ? ' on' : ''}`} onClick={() => setSize(s)} aria-pressed={size === s}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="pp-price">
        <PriceTag price={product.price} onSale={product.onSale} salePrice={product.salePrice} saleEnd={product.saleEnd} size="lg" />
        {saleOn && product.saleEnd && <SaleCountdown end={product.saleEnd} />}
      </div>

      <div className="pp-actions">
        <div className="qty" aria-label="Количество">
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Меньше"><Minus size={14} /></button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(q => Math.min(maxPick, q + 1))} disabled={qty >= maxPick} aria-label="Больше"><Plus size={14} /></button>
        </div>
        <button type="button" className={`btn-primary pp-add${justAdded ? ' added' : ''}`} onClick={addToCart} disabled={soldOut}>
          {soldOut ? 'Уже в корзине' : justAdded ? <><Check size={18} /> Добавлено</> : <><ShoppingBag size={18} /> В корзину</>}
        </button>
        <OrderModal productId={product.id} productName={product.name} settings={settings} note={note} trigger={
          <button type="button" className="btn-ink pp-oneclick"><Zap size={18} /> Купить в 1 клик</button>
        } />
      </div>
      {stock != null && stock > 0 && <p className="pp-stock-note">В наличии {stock} шт{room < stock ? `, в корзине уже ${stock - room}` : ''}</p>}
      {justAdded && <button type="button" className="pp-go-cart" onClick={() => setOpen(true)}>Перейти в корзину →</button>}
    </div>
  )
}
