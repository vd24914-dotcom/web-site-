export const revalidate = 3600
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Каталог вязаных изделий',
  description: 'Все вязаные изделия ручной работы: свитеры, шапки, пледы, игрушки. Доставка по всему Узбекистану.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const cat = (await searchParams).category
  const [settings, products, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { inStock: true, ...(cat ? { category: { slug: cat } } : {}) },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  return (
    <>
      <Header settings={settings} />
      <main>
        <div style={{ background: 'linear-gradient(135deg,var(--cream) 0%,var(--pink-mist) 100%)', padding: '52px 0 36px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <h1 className="font-display" style={{ fontSize: '2.4rem', color: 'var(--text)', marginBottom: 6 }}>Каталог</h1>
            <p style={{ color: 'var(--text-sub)' }}>{(products as any[]).length} товаров в наличии</p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32, paddingBottom: 88 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/catalog" style={{ textDecoration: 'none' }}>
              <button className={!cat ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem' }}>Все</button>
            </Link>
            {(categories as any[]).map(c => (
              <Link key={c.id} href={`/catalog?category=${c.slug}`} style={{ textDecoration: 'none' }}>
                <button className={cat === c.slug ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem' }}>
                  {c.emoji} {c.name}
                </button>
              </Link>
            ))}
          </div>

          {(products as any[]).length === 0 ? (
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
                        <div style={{ height: 260, background: img ? 'transparent' : 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden', position: 'relative' }}>
                          {img
                            ? <img src={img} alt={p.name} loading="lazy" decoding="async" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : p.category?.emoji || '🧶'
                          }
                          {p.featured && <div style={{ position: 'absolute', top: 12, left: 12 }}><span className="badge badge-rose">⭐ Хит</span></div>}
                        </div>
                        <div style={{ padding: '16px 18px 20px' }}>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
                          <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
                          <p style={{ fontSize: '.84rem', color: 'var(--text-sub)', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="font-display" style={{ fontSize: '1.15rem', color: 'var(--pink)', fontWeight: 700 }}>{formatPrice(p.price)}</span>
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
