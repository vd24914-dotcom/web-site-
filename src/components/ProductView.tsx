import Link from 'next/link'
import { ChevronRight, Play } from 'lucide-react'
import { parseJSON } from '@/lib/utils'
import { ProductGallery } from '@/components/ProductGallery'
import { RestockCountdown } from '@/components/RestockCountdown'
import { ProductBuy } from '@/components/ProductBuy'
import { ScrollReveal } from '@/components/ScrollReveal'

/**
 * Страница товара (внутри main): хлебные крошки, белая панель с галереей слева и
 * сведениями справа — название, артикул, таблица характеристик, выбор цвета/размера,
 * цена, «В корзину» и «Купить в 1 клик»; ниже — описание.
 */
export function ProductView({ p, settings }: { p: any; settings: Record<string, string> }) {
  const images: string[] = parseJSON(p.images || '[]')
  const colors: string[] = parseJSON(p.colors || '[]')
  const sizes: string[] = parseJSON(p.sizes || '[]')
  const sku = String(p.id).padStart(4, '0')
  const availability = p.restockAt
    ? null
    : p.inStock ? `В наличии${p.quantity != null ? ` · осталось ${p.quantity} шт` : ''}` : 'Под заказ · 7–14 дней'

  return (
    <div className="container pp">
      <nav className="pp-crumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link><ChevronRight size={14} aria-hidden="true" />
        <Link href="/catalog">Каталог</Link><ChevronRight size={14} aria-hidden="true" />
        {p.category && <><Link href={`/catalog?category=${p.category.slug}`}>{p.category.name}</Link><ChevronRight size={14} aria-hidden="true" /></>}
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="pp-panel">
        <div className="pp-grid">
          <ScrollReveal direction="left">
            <ProductGallery images={images} emoji={p.category?.emoji} name={p.name} />
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="pp-info">
              <h1 className="font-display pp-title">{p.name}</h1>
              <div className="pp-meta">
                <span>Артикул: <b>{sku}</b></span>
                {p.category && <Link href={`/catalog?category=${p.category.slug}`} className="pp-cat">{p.category.emoji} {p.category.name}</Link>}
              </div>

              <dl className="pp-specs">
                {p.category && <><dt>Категория</dt><dd>{p.category.name}</dd></>}
                {availability
                  ? <><dt>Наличие</dt><dd className={p.inStock ? 'ok' : ''}>{availability}</dd></>
                  : <><dt>Наличие</dt><dd><RestockCountdown at={p.restockAt} qty={p.restockQty} /></dd></>}
                {colors.length > 0 && <><dt>Цвета</dt><dd>{colors.join(', ')}</dd></>}
                {sizes.length > 0 && <><dt>Размеры</dt><dd>{sizes.join(', ')}</dd></>}
                <dt>Изготовление</dt><dd>Ручная работа, натуральные нити</dd>
              </dl>

              <ProductBuy
                settings={settings}
                product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, onSale: p.onSale, salePrice: p.salePrice, saleEnd: p.saleEnd, image: images[0], colors, sizes, inStock: !!p.inStock, quantity: p.quantity ?? null }}
              />

              {p.videoUrl && (
                <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="pp-video"><Play size={16} /> Смотреть видео</a>
              )}
              <p className="pp-hint">После заявки свяжемся с вами и обсудим детали: цвет, размер, сроки и доставку.</p>
            </div>
          </ScrollReveal>
        </div>

        {p.description && (
          <section className="pp-desc">
            <h2 className="font-display">Описание</h2>
            <p>{p.description}</p>
          </section>
        )}
      </div>
    </div>
  )
}
