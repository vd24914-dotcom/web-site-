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
import { Typewriter } from '@/components/Typewriter'
import { SocialLinks } from '@/components/SocialLinks'
import { PromoBanner } from '@/components/PromoBanner'
import { SaleCountdown } from '@/components/SaleCountdown'
import { RestockCountdown } from '@/components/RestockCountdown'
import { ArrowRight } from 'lucide-react'
import { InstagramIcon } from '@/components/SocialLinks'
import { ReelCard } from '@/components/ReelCard'
import { parseReels } from '@/lib/reels'

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
  // Блок рилсов показывается только когда включён в админке (Дизайн и контент → Рилсы)
  const reels = settings.reels_enabled === '1' ? parseReels(settings.reels) : []
  const igRaw = (settings.social_instagram || '').trim()
  const igLink = igRaw ? (igRaw.startsWith('http') ? igRaw : `https://instagram.com/${igRaw.replace(/^@/, '')}`) : ''

  return (
    <>
      <Header settings={settings} />
      <PromoBanner end={settings.sale_end} title={settings.sale_title} />
      <main>

        {/* HERO */}
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '90px 0 110px', overflow: 'hidden' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <ScrollReveal delay={80}>
                <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.8rem)', lineHeight: 1.18, color: 'var(--text)', marginBottom: 22 }}>
                  {s('hero_title').split('\n').map((l, i) => (
                    <span key={i}>
                      {i === 1
                        ? <Typewriter text={l} style={{ color: 'var(--pink)', fontStyle: 'italic', fontSize: '.82em' }} />
                        : l}
                      <br />
                    </span>
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
              <div className="hero-badge-float" style={{ position: 'absolute', top: 24, right: 0, background: 'var(--white)', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 28px rgba(250,135,161,.18)', border: '1px solid var(--border)', animation: 'float 3.5s ease-in-out infinite' }}>
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
                { icon: '💝', img: settings.benefit1_icon, title: s('benefit1_title'), desc: s('benefit1_desc') },
                { icon: '✏️', img: settings.benefit2_icon, title: s('benefit2_title'), desc: s('benefit2_desc') },
                { icon: '⭐', img: settings.benefit3_icon, title: s('benefit3_title'), desc: s('benefit3_desc') },
                { icon: '🚚', img: settings.benefit4_icon, title: s('benefit4_title'), desc: s('benefit4_desc') },
              ].map((b, i) => (
                <ScrollReveal key={b.title} delay={i * 80}>
                  <div style={{ textAlign: 'center', padding: '16px 12px' }}>
                    {b.img
                      ? <img src={b.img} alt="" className="icon-bounce" style={{ width: 58, height: 58, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
                      : <span className="icon-bounce" style={{ fontSize: 42, marginBottom: 16, display: 'block' }}>{b.icon}</span>}
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
                        {cat.icon
                          ? <img src={cat.icon} alt={cat.name} className="icon-bounce" style={{ width: 50, height: 50, objectFit: 'contain', margin: '0 auto 10px', display: 'block' }} />
                          : <span className="icon-bounce" style={{ fontSize: 42, marginBottom: 10, display: 'block' }}>{cat.emoji}</span>}
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
                                {p.onSale && p.salePrice && <span className="badge badge-sale">🏷 Скидка</span>}
                                {p.onSale && p.salePrice && p.saleEnd && <SaleCountdown end={p.saleEnd} mini />}
                              </div>
                            )}
                            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 5 }}>{p.category?.name}</div>
                            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: '1rem', lineHeight: 1.4 }}>{p.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <PriceTag price={p.price} onSale={p.onSale} salePrice={p.salePrice} />
                              {p.restockAt
                                ? <RestockCountdown at={p.restockAt} qty={p.restockQty} mini />
                                : <span style={{ fontSize: '.78rem', color: p.inStock ? '#2e7d45' : '#e53e3e', fontWeight: 600 }}>{p.inStock ? '✓ В наличии' : 'Под заказ'}</span>}
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

        {/* REELS */}
        {reels.length > 0 && (
          <section id="reels" style={{ padding: '72px 0', background: 'var(--pink-mist)', overflow: 'hidden' }}>
            <div className="container">
              <ScrollReveal>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span className="badge badge-rose" style={{ marginBottom: 12 }}><InstagramIcon size={13} /> Instagram</span>
                    <h2 className="font-display" style={{ fontSize: '2.1rem', color: 'var(--text)', marginBottom: 8 }}>{s('reels_title')}</h2>
                    <p style={{ color: 'var(--text-sub)' }}>{s('reels_subtitle')}</p>
                  </div>
                  {igLink && (
                    <a href={igLink} target="_blank" rel="noopener noreferrer" className="btn-outline">{s('reels_btn')} <ArrowRight size={16} /></a>
                  )}
                </div>
              </ScrollReveal>
              <div className="reels-row">
                {reels.map((r, i) => (
                  <ScrollReveal key={r.id} delay={(i % 4) * 80} className="reels-item">
                    <ReelCard id={r.id} cover={r.cover} index={i} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
            <style>{`
              .reels-row{display:flex;gap:20px;overflow-x:auto;padding:6px 4px 18px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--pink-light) transparent}
              .reels-row::-webkit-scrollbar{height:6px}
              .reels-row::-webkit-scrollbar-thumb{background:var(--pink-light);border-radius:6px}
              .reels-item{flex:0 0 280px;scroll-snap-align:start}
              .reels-card{position:relative;width:280px;height:560px;border-radius:22px;overflow:hidden;background:var(--white);border:1px solid var(--border);box-shadow:0 14px 40px rgba(250,135,161,.18);transition:transform .25s,box-shadow .25s}
              .reels-card:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(250,135,161,.26)}
              .reels-card iframe{width:100%;height:100%;border:0;display:block;background:var(--white)}
              .reels-cover{position:relative;width:100%;height:100%;border:0;padding:0;cursor:pointer;background:var(--pink-light);display:block;overflow:hidden}
              .reels-cover img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
              .reels-cover:hover img{transform:scale(1.04)}
              .reels-cover::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.35) 100%);pointer-events:none}
              .reels-cover-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--pink-deep);background:linear-gradient(160deg,var(--pink-light) 0%,var(--cream-dark) 60%,var(--pink-mist) 100%)}
              .reels-play{position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:rgba(255,255,255,.92);color:var(--pink-deep);display:flex;align-items:center;justify-content:center;padding-left:4px;box-shadow:0 10px 30px rgba(0,0,0,.22);transition:transform .25s,background .25s;z-index:1}
              .reels-cover:hover .reels-play{transform:scale(1.08);background:var(--pink);color:#fff}
              .reels-hint{position:absolute;top:12px;left:12px;display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.85);color:var(--pink-deep);font-size:.7rem;font-weight:700;letter-spacing:.02em;z-index:1}
              .reels-open{position:absolute;left:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.92);color:var(--pink-deep);font-size:.75rem;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.12);backdrop-filter:blur(6px)}
              .reels-open:hover{background:var(--pink);color:#fff}
              @media(max-width:768px){.reels-item{flex-basis:240px}.reels-card{width:240px;height:480px}}
            `}</style>
          </section>
        )}

        {/* ABOUT */}
        <section id="about" style={{ padding: '88px 0', background: 'var(--cream)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <ScrollReveal direction="left">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {settings.about_image ? (
                  <div className="about-art" style={{ width: 460, height: 500, borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(250,135,161,.22)' }}>
                    <img src={settings.about_image} alt="О мастере" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="about-art gradient-flow" style={{ width: 420, height: 460, background: 'linear-gradient(135deg,var(--pink-light) 0%,var(--cream-dark) 50%,var(--pink-light) 100%)', borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, boxShadow: '0 24px 64px rgba(250,135,161,.2)' }}>
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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <SocialLinks settings={settings} size={20} />
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer settings={settings} />
    </>
  )
}
