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
import { ArrowRight } from 'lucide-react'
import { getSettings } from '@/lib/settings'
import { makeT } from '@/lib/content'
import { SiteIcon } from '@/components/SiteIcon'

export const metadata: Metadata = {
  title: 'Каталог вязаных изделий',
  description: 'Все вязаные изделия ручной работы: свитеры, шапки, пледы, игрушки. Доставка по всему Узбекистану.',
}


type PickFilter = 'picks' | 'popular' | 'sale' | ''

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; filter?: string }> }) {
  const sp = await searchParams
  const cat = sp.category
  const q = normalizeQuery(sp.q)
  const filter: PickFilter = (['picks', 'popular', 'sale'] as const).includes(sp.filter as any) ? (sp.filter as PickFilter) : ''
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
  const t = makeT(settings)
  const FILTERS: { key: PickFilter; label: string; title: string; sub: string }[] = [
    { key: 'picks',   label: t('filter_picks'),   title: t('filter_picks'),         sub: t('filter_picks_sub') },
    { key: 'popular', label: t('filter_popular'), title: t('filter_popular_title'), sub: t('filter_popular_sub') },
    { key: 'sale',    label: t('filter_sale'),    title: t('filter_sale_title'),    sub: t('filter_sale_sub') },
    { key: '',        label: t('filter_all'),     title: t('catalog_title'),        sub: '' },
  ]
  const filterMeta = FILTERS.find(f => f.key === filter)!
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
              <h1 className="font-display" style={{ fontSize: '2.4rem', color: 'var(--text)', marginBottom: 6 }}>{q ? t('catalog_search_title') : filterMeta.title}</h1>
              <p style={{ color: 'var(--text-sub)' }}>
                {q
                  ? <>{products.length === 0 ? t('catalog_nothing') : `${products.length} ${plural(products.length)}`} по запросу «<b style={{ color: 'var(--text)' }}>{q}</b>»{filter ? ` среди «${filterMeta.title.toLowerCase()}»` : ''}</>
                  : filter
                    ? `${filterMeta.sub} · ${products.length} ${plural(products.length)}`
                    : `${products.length} ${plural(products.length)} ${t('catalog_count')}`}
              </p>
            </div>
            <CatalogSearch q={q} category={cat} filter={filter} />
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32, paddingBottom: 88 }}>
          {/* Переключатель «что показывать»: отмеченные в админке или весь каталог */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18, padding: '10px 12px', background: 'var(--pink-mist)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600, marginRight: 4 }}>{t('catalog_show')}</span>
            {FILTERS.map(f => {
              const active = f.key === filter
              return (
                <Link key={f.key || 'all'} href={buildHref({ category: cat, filter: f.key, q })}
                  style={{ textDecoration: 'none', padding: '7px 14px', borderRadius: 999, fontSize: '.82rem', fontWeight: 600, border: '1px solid', transition: 'all .15s',
                    background: active ? 'var(--pink)' : 'var(--white)', borderColor: active ? 'var(--pink)' : 'var(--border)', color: active ? 'var(--on-pink, #fff)' : 'var(--text-sub)' }}>
                  {f.label}
                </Link>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href={withQ('/catalog')} className={!cat ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem', textDecoration: 'none' }}>{t('catalog_all')}</Link>
            {(categories as any[]).map(c => (
              <Link key={c.id} href={withQ(`/catalog?category=${c.slug}`)} className={cat === c.slug ? 'btn-primary' : 'btn-outline'} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem', textDecoration: 'none' }}>
                {c.name}
              </Link>
            ))}
          </div>

          {products.length === 0 && !q && filter ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico"><SiteIcon k={filter === 'sale' ? 'icon_empty_sale' : 'icon_empty_picks'} size={30} /></div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>{filter === 'sale' ? t('catalog_empty_sale') : t('catalog_empty_picks')}</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>{t('catalog_empty_filter_text')}</p>
              <Link href={buildHref({ category: cat, q })} className="btn-primary">{t('filter_all')} <ArrowRight size={16} /></Link>
            </div>
          ) : products.length === 0 && q ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico"><SiteIcon k="icon_notfound" size={30} /></div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>{t('catalog_notfound_title', { q })}</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>{t('catalog_notfound_text')}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={cat || filter ? buildHref({ q }) : '/catalog'} className="btn-outline">{cat || filter ? t('catalog_search_all') : t('filter_all')}</Link>
                <OrderModal settings={settings} trigger={<button className="btn-primary">{t('catalog_order_btn')}</button>} />
              </div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="empty-ico"><SiteIcon k="icon_empty_catalog" size={30} /></div>
              <h2 className="font-display" style={{ color: 'var(--text)', marginBottom: 12 }}>{t('catalog_empty_title')}</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: 28 }}>{t('catalog_empty_text')}</p>
              <OrderModal settings={settings} trigger={<button className="btn-primary">{t('catalog_order_btn')}</button>} />
            </div>
          ) : (
            <div className="home-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(278px,1fr))', gap: 24 }}>
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
