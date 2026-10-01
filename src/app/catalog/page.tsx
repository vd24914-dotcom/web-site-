export const revalidate = 3600
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ProductCard } from '@/components/ProductCard'
import { CatalogSearch } from '@/components/CatalogSearch'
import { normalizeQuery, searchProducts } from '@/lib/search'
import { isSaleActive } from '@/lib/sale'
import { ArrowRight, Tag, Star, SearchX, PackageOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Каталог вязаных изделий',
  description: 'Все вязаные изделия ручной работы: свитеры, шапки, пледы, игрушки. Доставка по всему Узбекистану.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

type PickFilter = 'picks' | 'popular' | 'sale' | ''
const FILTERS: { key: PickFilter; label: string; title: string; sub: string }[] = [
  { key: 'picks',   label: 'Популярные и акции', title: 'Популярные и акции', sub: 'Изделия, которые мы отметили как популярные или поставили на акцию' },
  { key: 'popular', label: 'Только популярные',   title: 'Популярные изделия', sub: 'Самые востребованные работы' },
  { key: 'sale',    label: 'Только акции',        title: 'Товары на акции',    sub: 'Успейте заказать по выгодной цене' },
  { key: '',        label: 'Весь каталог',           title: 'Каталог',            sub: '' },
]

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; filter?: string }> }) {
  const sp = await searchParams
  const cat = sp.category
  const q = normalizeQuery(sp.q)
  const filter: PickFilter = (['picks', 'popular', 'sale'] as const).includes(sp.filter as any) ? (sp.filter as PickFilter) : ''
  const filterMeta = FILTERS.find(f => f.key === filter)!
  const [settings, allProducts, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { inStock: true, ...(cat ? { category: { slug: cat } } : {}) },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])
  // Фильтр «отмеченные в админке»: популярные и/или акционные (с действующим сроком)
  const picked = (allProducts as any[]).filter((p) =>
    filter === 'popular' ? !!p.featured
    : filter === 'sale' ? isSaleActive(p)
    : filter === 'picks' ? (!!p.featured || isSaleActive(p))
    : true)
  // Фильтр по поисковому запросу (?q=) поверх выбранной категории
  const products = q ? searchProducts(picked, q) : picked
  const buildHref = (opts: { category?: string; filter?: PickFilter; q?: string }) => {
    const params = new URLSearchParams()
    if (opts.category) params.set('category', opts.category)
    if (opts.filter) params.set('filter', opts.filter)
    if (opts.q) params.set('q', opts.q)
    const qs = params.toString()
    return qs ? `/catalog?${qs}` : '/catalog'
  }
  const withQ = (href: string) => {
    const u = new URL(href, 'http://x')
    return buildHref({ category: u.searchParams.get('category') || undefined, filter, q })
  }

  return (
    <>
      <Header settings={settings} />
      <main>
        <div style={{ background: 'linear-gradient(135deg,var(--cream) 0%,var(--pink-mist) 100%)', padding: '52px 0 36px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '2.4rem', color: 'var(--text)', marginBottom: 6 }}>{q ? 'Поиск' : filterMeta.title}</h1>
              <p style={{ color: 'var(--text-sub)' }}>
                {q
                  ? <>{products.length === 0 ? 'Ничего не найдено' : `${products.length} ${plural(products.length)}`} по запросу «<b style={{ color: 'var(--text)' }}>{q}</b>»{filter ? ` среди «${filterMeta.title.toLowerCase()}»` : ''}</>
                  : filter
                    ? `${filterMeta.sub} · ${products.length} ${plural(products.length)}`
                    : `${products.length} товаров в наличии`}
              </p>
            </div>
            <CatalogSearch q={q} category={cat} filter={filter} />
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32, paddingBottom: 88 }}>
          {/* Переключатель «что показывать»: отмеченные в админке или весь каталог */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18, padding: '10px 12px', background: 'var(--pink-mist)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600, marginRight: 4 }}>Показать:</span>
            {FILTERS.map(f => {
              const active = f.key === filter
              return (
                <Link key={f.key || 'all'} href={buildHref({ category: cat, filter: f.key, q })}
                  style={{ textDecoration: 'none', padding: '7px 14px', borderRadius: 999, fontSize: '.82rem', fontWeight: 600, border: '1px solid', transition: 'all .15s',
                    background: active ? 'var(--pink)' : 'var(--white)', borderColor: active ? 'var(--pink)' : 'var(--border)', color: active ? '#fff' : 'var(--text-sub)' }}>
                  {f.label}
                </Link>
              )
            })}
          </div>
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

          {products.length === 0 && !q && filter ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico">{filter === 'sale' ? <Tag size={30} /> : <Star size={30} />}</div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>{filter === 'sale' ? 'Сейчас нет товаров на акции' : 'Пока ничего не отмечено'}</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>Загляните в полный каталог — там всё, что есть в наличии</p>
              <Link href={buildHref({ category: cat, q })} className="btn-primary">Весь каталог <ArrowRight size={16} /></Link>
            </div>
          ) : products.length === 0 && q ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico"><SearchX size={30} /></div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>По запросу «{q}» ничего не нашлось</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>Попробуйте другое слово{cat ? ' или снимите фильтр по категории' : ''}. А если нужно что-то особенное — напишите нам, свяжем под заказ</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={cat || filter ? buildHref({ q }) : '/catalog'} className="btn-outline">{cat || filter ? 'Искать по всему каталогу' : 'Весь каталог'}</Link>
                <OrderModal settings={settings} trigger={<button className="btn-primary">Оставить заявку</button>} />
              </div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico"><PackageOpen size={30} /></div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>Скоро здесь появятся товары</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>Напишите нам, если хотите что-то заказать</p>
              <OrderModal settings={settings} trigger={<button className="btn-primary">Оставить заявку</button>} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(278px,1fr))', gap: 24 }}>
              {(products as any[]).map((p, i) => {
                return (
                  <ScrollReveal key={p.id} delay={(i % 3) * 80}>
                    <ProductCard p={p} showDescription />
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
