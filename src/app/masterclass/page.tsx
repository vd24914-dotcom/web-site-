export const revalidate = 600
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TEXTS } from '@/lib/texts'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollReveal } from '@/components/ScrollReveal'
import { MasterClassCard } from '@/components/MasterClassCard'

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: `${s.masterclass_title || TEXTS.masterclass_title} — ${s.site_name || TEXTS.site_name}`,
    description: s.masterclass_subtitle || TEXTS.masterclass_subtitle,
  }
}

export default async function MasterClassPage() {
  const [settings, items] = await Promise.all([
    getSettings(),
    prisma.masterClass.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }).catch(() => []),
  ])
  const s = (k: keyof typeof TEXTS) => settings[k] || TEXTS[k]
  const list = items as any[]
  const enabled = settings.masterclass_enabled === '1'

  // Раздел выключен: заглушка «временно недоступно»
  if (!enabled) {
    return (
      <>
        <Header settings={settings} />
        <main>
          <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '96px 0 110px', overflow: 'hidden', position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <ScrollReveal>
                <div className="animate-float" style={{ width: 132, height: 132, margin: '0 auto 26px', borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, boxShadow: '0 20px 50px rgba(250,135,161,.25)', border: '1px solid var(--border)' }}>🧶</div>
                <span className="badge badge-rose" style={{ marginBottom: 14 }}>🎓 Видеоуроки</span>
                <h1 className="font-display" style={{ fontSize: 'clamp(1.9rem,4.2vw,2.8rem)', color: 'var(--text)', marginBottom: 14 }}>{s('masterclass_title')}</h1>
                <p style={{ color: 'var(--text-sub)', maxWidth: 520, margin: '0 auto 10px', lineHeight: 1.7, fontSize: '1.05rem' }}>Раздел временно недоступен — мы готовим первые уроки.</p>
                <p style={{ color: 'var(--text-sub)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>Совсем скоро здесь появятся пошаговые видео по вязанию. А пока загляните в каталог или следите за новостями.</p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/catalog" className="btn-primary">Смотреть каталог <ArrowRight size={16} /></Link>
                  <Link href="/news" className="btn-outline">Новости</Link>
                </div>
              </ScrollReveal>
            </div>
            <div aria-hidden="true" className="animate-float" style={{ position: 'absolute', right: -60, top: -40, width: 260, height: 260, borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%', background: 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', opacity: .7 }} />
            <div aria-hidden="true" className="animate-float" style={{ position: 'absolute', left: -80, bottom: -90, width: 220, height: 220, borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', background: 'linear-gradient(135deg,var(--cream-dark),var(--pink-light))', opacity: .6, animationDelay: '1.2s' }} />
          </section>
        </main>
        <Footer settings={settings} />
      </>
    )
  }

  return (
    <>
      <Header settings={settings} />
      <main>
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '64px 0 44px', overflow: 'hidden', position: 'relative' }}>
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <ScrollReveal>
              <span className="badge badge-rose" style={{ marginBottom: 14 }}>🎓 Видеоуроки</span>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.9rem,4.2vw,2.8rem)', color: 'var(--text)', marginBottom: 12 }}>{s('masterclass_title')}</h1>
              <p style={{ color: 'var(--text-sub)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>{s('masterclass_subtitle')}</p>
            </ScrollReveal>
            {list.length > 0 && (
              <ScrollReveal delay={120}>
                <div style={{ display: 'inline-flex', gap: 28, marginTop: 28, padding: '12px 22px', borderRadius: 999, background: 'var(--white)', border: '1px solid var(--border)', boxShadow: '0 8px 28px rgba(250,135,161,.16)' }}>
                  <div><div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--pink)', fontWeight: 700 }}>{list.length}</div><div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>{plural(list.length)}</div></div>
                  <div><div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--pink)', fontWeight: 700 }}>0 сум</div><div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>Бесплатно</div></div>
                  <div><div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--pink)', fontWeight: 700 }}>HD</div><div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>Качество</div></div>
                </div>
              </ScrollReveal>
            )}
          </div>
          <div aria-hidden="true" className="animate-float" style={{ position: 'absolute', right: -60, top: -40, width: 260, height: 260, borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%', background: 'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', opacity: .7 }} />
          <div aria-hidden="true" className="animate-float" style={{ position: 'absolute', left: -80, bottom: -90, width: 220, height: 220, borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', background: 'linear-gradient(135deg,var(--cream-dark),var(--pink-light))', opacity: .6, animationDelay: '1.2s' }} />
        </section>

        <section style={{ padding: '48px 0 96px', background: 'var(--white)' }}>
          <div className="container">
            {list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                <p style={{ color: 'var(--text-sub)' }}>Мастер-классы скоро появятся — заглядывайте позже</p>
              </div>
            ) : (
              <div className="mc-grid">
                {list.map((item, i) => (
                  <ScrollReveal key={item.id} delay={(i % 3) * 90}>
                    <MasterClassCard item={item} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}

function plural(n: number) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'Мастер-класс'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'Мастер-класса'
  return 'Мастер-классов'
}
