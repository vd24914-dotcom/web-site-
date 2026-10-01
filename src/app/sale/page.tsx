// Страница скидок обновляется чаще остальных, чтобы завершённые акции быстро исчезали из списка
export const revalidate = 300
import { Tag } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ProductCard } from '@/components/ProductCard'
import { PromoBanner } from '@/components/PromoBanner'
import { isSaleActive } from '@/lib/sale'

export const metadata: Metadata = {
  title: 'Скидки — Fimush.kin',
  description: 'Вязаные изделия ручной работы со скидкой. Успейте заказать по выгодной цене.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export default async function SalePage() {
  const [settings, allSale] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { onSale: true, salePrice: { not: null }, inStock: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])
  // Только акции, срок которых ещё не вышел
  const products = (allSale as any[]).filter((p) => isSaleActive(p))

  return (
    <>
      <Header settings={settings} />
      <PromoBanner end={settings.sale_end} title={settings.sale_title} />
      <main>
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '56px 0 36px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="badge badge-sale" style={{ marginBottom: 14 }}>Акция</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--text)', marginBottom: 10 }}>Скидки</h1>
            <p style={{ color: 'var(--text-sub)' }}>Изделия ручной работы по выгодной цене</p>
          </div>
        </section>

        <section style={{ padding: '40px 0 80px' }}>
          <div className="container">
            {(products as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div className="empty-ico"><Tag size={30} /></div>
                <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>Сейчас нет товаров со скидкой. Загляните позже!</p>
                <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
              </div>
            ) : (
              <div className="home-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
                {(products as any[]).map((p, i) => {
                  return (
                    <ScrollReveal key={p.id} delay={(i % 3) * 80}>
                      <ProductCard p={p} />
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
