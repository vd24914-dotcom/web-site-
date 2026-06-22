import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { TEXTS } from '@/lib/texts'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PriceTag } from '@/components/PriceTag'
import { ArrowRight } from 'lucide-react'

// Кэшируем страницу: посетители получают её мгновенно (без обращения к базе),
// а при изменении товаров/настроек в админке кэш обновляется автоматически.
export const revalidate = 3600

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: `${s.site_name || TEXTS.site_name} — Вязаные изделия ручной работы | Ташкент`,
    description: s.hero_subtitle || TEXTS.hero_subtitle,
    openGraph: { images: s.og_image ? [{ url: s.og_image }] : [] },
  }
}

export default async function HomePage() {
  const [settings, featured, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({ where: { featured: true, inStock: true }, include: { category: true }, take: 6 }).catch(() => []),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])
  const s = (k: keyof typeof TEXTS) => settings[k] || TEXTS[k]

  return (
    <>
      <Header settings={settings} />
      <main>

        {/* HERO */}
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '90px 0 110px', overflow: 'hidden' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <ScrollReveal>
                <span className="badge badge-rose" style={{ marginBottom: 22 }}>✨ {s('hero_badge')}</span>
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <h1 className="font-display" style={{ fontSize: 'clamp(2.1rem,5vw,3.4rem)', lineHeight: 1.12, color: 'var(--text)', marginBottom: 22 }}>
                  {s('hero_title').split('\n').map((l, i) => (
                    <span key={i}>{i === 1 ? <em style={{ color: 'var(--pink)', fontStyle: 'italic' }}>{l}</em> : l}<br /></span>
                  ))}
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-sub)', lineHeight: 1.75, marginBottom: 38, maxWidth: 430 }}>{s('hero_subtitle')}</p>
              </ScrollReveal>
              <ScrollReveal delay={220}>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
                  <Link href="/catalog" className="btn-primary">{s('hero_btn')} <ArrowRight size={16} /></Link>
                  <a href="#about" className="btn-outline">{s('hero_btn2')}</a>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={280}>
                <div style={{ display: 'flex', gap: 36 }}>
                  {[[s('stats1'),s('stats1_label')],[s('stats2'),s('stats2_label')],[s('stats3'),s('stats3_label')]].map(([v,l])=>(
                    <div key={String(l)}>
                      <div className="font-display" style={{ fontSize: '1.7rem', color: 'var(--pink)', fontWeight: 700 }}>{v}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="right" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {settings.hero_image ? (
                <div className="animate-float hero-art" style={{ width: 450, height: 490, borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(250,135,161,.28)' }}>
                  <img src={settings.hero_image} alt={s('site_name')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="animate-float hero-art gradient-flow" style={{ width: 420, height: 460, background: 'linear-gradient(135deg, var(--pink-light) 0%, var(--cream-dark) 50%, var(--pink-light) 100%)', borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 140, boxShadow: '0 24px 64px rgba(250,135,161,.25)' }}>
                  {s('hero_icon')}
                </div>
              )}
              <div className="hero-badge-float" style={{ position: 'absolute', top: 24, right: 0, background: 'var(--white)', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 28px rgba(250,135,161,.18)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.85rem' }}>{s('hero_badge2')}</div>
                <div style={{ color: 'var(--text-sub)', fontSize: '.75rem', marginTop: 2 }}>{s('hero_badge2_sub')}</div>
              </div>
            </ScrollReveal>
          </div>
          <style>{`@media(max-width:768px){section div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* BENEFITS */}
        <section style={{ padding: '72px 0', background: 'var(--white)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32 }}>
              {[
                { icon: '💝', title: s('benefit1_title'), desc: s('benefit1_desc') },
                { icon: '✏️', title: s('benefit2_title'), desc: s('benefit2_desc') },
                { icon: '⭐', title: s('benefit3_title'), desc: s('benefit3_desc') },
                { icon: '🚚', title: s('benefit4_title'), desc: s('benefit4_desc') },
              ].map((b, i) => (
                <ScrollReveal key={b.title} delay={i * 80}>
                  <div style={{ textAlign: 'center', padding: '16px 12px' }}>
                    <span className="icon-bounce" style={{ fontSize: 42, marginBottom: 16, display: 'block' }}>{b.icon}</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{b.title}</h3>
                    <p style={{ fontSize: '.85rem', color: 'var(--text-sub)', lineHeight: 1.65 }}>{b.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        {(categories as any[]).length > 0 && (
          <section style={{ padding: '72px 0', background: 'var(--cream)' }}>
            <div className="container">
              <ScrollReveal>
                <div style={{ textAlign: 'center', marginBottom: 44 }}>
                  <h2 className="font-display" style={{ fontSize: '2.1rem', color: 'var(--text)', marginBottom: 10 }}>Категории</h2>
                  <p style={{ color: 'var(--text-sub)' }}>Найдите что-то особенное для себя или в подарок</p>
                </div>
              </ScrollReveal>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 16 }}>
                {(categories as any[]).map((cat, i) => (
                  <ScrollReveal key={cat.id} delay={i * 60}>
                    <Link href={`/catalog?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="card" style={{ padding: '26px 16px', textAlign: 'center', cursor: 'pointer' }}>
                        <span className="icon-bounce" style={{ fontSize: 42, marginBottom: 10, display: 'block' }}>{cat.emoji}</span>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9rem' }}>{cat.name}</div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FEATURED */}
        {(featured as any[]).length > 0 && (
          <section style={{ padding: '72px 0', background: 'var(--white)' }}>
            <div className="container">
              <ScrollReveal>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: '2.1rem', color: 'var(--text)', marginBottom: 8 }}>Популярные изделия</h2>
                    <p style={{ color: 'var(--text-sub)' }}>Самые востребованные работы</p>
                  </div>
                  <Link href="/catalog" className="btn-outline">Весь каталог <ArrowRight size={16} /></Link>
                </div>
              </ScrollReveal>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
                {(featured as any[]).map((p, i) => {
                  const imgs = parseJSON(p.images || '[]'); const img = imgs[0]
                  return (
                    <ScrollReveal key={p.id} delay={(i % 3) * 80}>
                      <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="card">
                          <div style={{ height: 248, background: img ? 'transparent' : 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden', position: 'relative' }}>
                            {img
                              ? <img src={img} alt={p.name} loading="lazy" decoding="async" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : p.category?.emoji || '🧶'
                            }
                          </div>
                          <div style={{ padding: '16px 18px 20px' }}>
                            {(p.featured || (p.onSale && p.salePrice)) && (
                              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                {p.featured && <span className="badge badge-hit">⭐ Хит</span>}
                                {p.onSale && p.salePrice && <span className="badge badge-sale">🏷 Скидка</span>}
                              </div>
                            )}
                            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
                            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} />
                              <span style={{ fontSize: '.78rem', color: p.inStock ? '#2e7d45' : '#e53e3e', fontWeight: 600 }}>{p.inStock ? '✓ В наличии' : 'Под заказ'}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ABOUT */}
        <section id="about" style={{ padding: '88px 0', background: 'var(--cream)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <ScrollReveal direction="left">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {settings.about_image ? (
                  <div className="about-art" style={{ width: 360, height: 400, borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(250,135,161,.22)' }}>
                    <img src={settings.about_image} alt="О мастере" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="about-art gradient-flow" style={{ width: 320, height: 360, background: 'linear-gradient(135deg,var(--pink-light) 0%,var(--cream-dark) 50%,var(--pink-light) 100%)', borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 88, boxShadow: '0 24px 64px rgba(250,135,161,.2)' }}>
                    {s('about_icon')}
                  </div>
                )}
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <span className="badge badge-rose" style={{ marginBottom: 18 }}>О мастере</span>
              <h2 className="font-display" style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: 18, lineHeight: 1.25 }}>{s('about_title')}</h2>
              <p style={{ color: 'var(--text-sub)', lineHeight: 1.8, fontSize: '1rem' }}>{s('about_text')}</p>
            </ScrollReveal>
          </div>
          <style>{`@media(max-width:768px){section#about div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* CTA */}
        <section id="contact" className="gradient-flow" style={{ background: 'linear-gradient(135deg,#FA87A1 0%,#e06080 50%,#c84060 100%)', padding: '88px 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <ScrollReveal>
              <h2 className="font-display" style={{ fontSize: '2.3rem', color: 'var(--white)', marginBottom: 16 }}>{s('cta_title')}</h2>
              <p style={{ color: 'rgba(255,255,255,.88)', fontSize: '1.05rem', marginBottom: 38, maxWidth: 480, margin: '0 auto 38px', lineHeight: 1.7 }}>{s('cta_text')}</p>
              <OrderModal settings={settings} trigger={
                <button className="cta-btn">{s('cta_btn')} <ArrowRight size={18} /></button>
              } />
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer settings={settings} />
    </>
  )
}
