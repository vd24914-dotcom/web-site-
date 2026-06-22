export const revalidate = 3600
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PriceTag } from '@/components/PriceTag'

export const metadata: Metadata = {
  title: 'Скидки — УютНить',
  description: 'Вязаные изделия ручной работы со скидкой. Успейте заказать по выгодной цене.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export default async function SalePage() {
  const [settings, products] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { onSale: true, salePrice: { not: null }, inStock: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  return (
    <>
      <Header settings={settings} />
      <main>
        <section style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 100%)', padding: '56px 0 36px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="badge badge-sale" style={{ marginBottom: 14 }}>🏷 Акция</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--text)', marginBottom: 10 }}>Скидки</h1>
            <p style={{ color: 'var(--text-sub)' }}>Изделия ручной работы по выгодной цене</p>
          </div>
        </section>

        <section style={{ padding: '40px 0 80px', background: 'var(--white)' }}>
          <div className="container">
            {(products as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏷</div>
                <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>Сейчас нет товаров со скидкой. Загляните позже!</p>
                <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
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
                          </div>
                          <div style={{ padding: '16px 18px 20px' }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                              {p.featured && <span className="badge badge-hit">⭐ Хит</span>}
                              <span className="badge badge-sale">🏷 Скидка</span>
                            </div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
                            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} />
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
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
