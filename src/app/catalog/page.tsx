export const revalidate = 3600
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PriceTag } from '@/components/PriceTag'
import { SaleBadge } from '@/components/SaleBadge'
import { RestockCountdown } from '@/components/RestockCountdown'
import { CatalogSearch } from '@/components/CatalogSearch'
import { normalizeQuery, searchProducts } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Каталог вязаных изделий',
  description: 'Все вязаные изделия ручной работы: свитеры, шапки, пледы, игрушки. Доставка по всему Узбекистану.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams
  const cat = sp.category
  const q = normalizeQuery(sp.q)
  const [settings, allProducts, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { inStock: true, ...(cat ? { category: { slug: cat } } : {}) },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])
  // Фильтр по поисковому запросу (?q=) поверх выбранной категории
  const products = q ? searchProducts(allProducts as any[], q) : (allProducts as any[])
  const withQ = (href: string) => (q ? `${href}${href.includes('?') ? '&' : '?'}q=${encodeURIComponent(q)}` : href)

  return (
    <>
      <Header settings={settings} />
      <main>
        <div style={{ background: 'linear-gradient(135deg,var(--cream) 0%,var(--pink-mist) 100%)', padding: '52px 0 36px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '2.4rem', color: 'var(--text)', marginBottom: 6 }}>{q ? 'Поиск' : 'Каталог'}</h1>
              <p style={{ color: 'var(--text-sub)' }}>
                {q
                  ? <>{products.length === 0 ? 'Ничего не найдено' : `${products.length} ${plural(products.length)}`} по запросу «<b style={{ color: 'var(--text)' }}>{q}</b>»</>
                  : `${products.length} товаров в наличии`}
              </p>
            </div>
            <CatalogSearch q={q} category={cat} />
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32, paddingBottom: 88 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href={withQ('/catalog')} style={{ textDecoration: 'none' }}>
              <button className={!cat ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem' }}>Все</button>
            </Link>
            {(categories as any[]).map(c => (
              <Link key={c.id} href={withQ(`/catalog?category=${c.slug}`)} style={{ textDecoration: 'none' }}>
                <button className={cat === c.slug ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem' }}>
                  {c.name}
                </button>
              </Link>
            ))}
          </div>

          {products.length === 0 && q ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 18 }}>🔍</div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>По запросу «{q}» ничего не нашлось</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>Попробуйте другое слово{cat ? ' или снимите фильтр по категории' : ''}. А если нужно что-то особенное — напишите нам, свяжем под заказ</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={cat ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog'} className="btn-outline">{cat ? 'Искать во всех категориях' : 'Весь каталог'}</Link>
                <OrderModal settings={settings} trigger={<button className="btn-primary">Оставить заявку</button>} />
              </div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 18 }}>🧶</div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>Скоро здесь появятся товары</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>Напишите нам, если хотите что-то заказать</p>
              <OrderModal settings={settings} trigger={<button className="btn-primary">Оставить заявку</button>} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(278px,1fr))', gap: 24 }}>
              {(products as any[]).map((p, i) => {
                const imgs = parseJSON(p.images || '[]'); const img = imgs[0]
                return (
                  <ScrollReveal key={p.id} delay={(i % 3) * 80}>
                    <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="card">
                        <div style={{ aspectRatio: '1', background: img ? 'transparent' : 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden', position: 'relative' }}>
                          {img
                            ? <img src={img} alt={p.name} loading="lazy" decoding="async" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : p.category?.emoji || '🧶'
                          }
                        </div>
                        <div style={{ padding: '16px 18px 20px' }}>
                          {(p.featured || (p.onSale && p.salePrice) || p.restockAt) && (
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                              {p.featured && <span className="badge badge-hit">✨ Новинка</span>}
                              <SaleBadge price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
                              {p.restockAt && <RestockCountdown at={p.restockAt} qty={p.restockQty} mini />}
                            </div>
                          )}
                          <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
                          <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
                          <p style={{ fontSize: '.84rem', color: 'var(--text-sub)', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} saleEnd={p.saleEnd} />
                            <span style={{ fontSize: '.78rem', padding: '.25rem .7rem', background: 'var(--pink-light)', color: 'var(--pink-deep)', borderRadius: 20, fontWeight: 600 }}>Заказать</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </>
  )
}

function plural(n: number) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'товар'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'товара'
  return 'товаров'
}
