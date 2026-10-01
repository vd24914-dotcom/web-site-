export const revalidate = 600
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollReveal } from '@/components/ScrollReveal'
import { getSettings } from '@/lib/settings'
import { makeT } from '@/lib/content'
import { SiteIcon } from '@/components/SiteIcon'

export const metadata: Metadata = {
  title: 'Новости — Fimush.kin',
  description: 'Новости, новинки и обновления мастерской Fimush.kin.',
}


export default async function NewsPage() {
  const [settings, news] = await Promise.all([
    getSettings(),
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])

  const t = makeT(settings)
  return (
    <>
      <Header settings={settings} />
      <main>
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '56px 0 36px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="badge badge-rose" style={{ marginBottom: 14 }}>{t('news_badge')}</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--text)', marginBottom: 10 }}>{t('news_title')}</h1>
            <p style={{ color: 'var(--text-sub)' }}>{t('news_subtitle')}</p>
          </div>
        </section>

        <section style={{ padding: '40px 0 80px' }}>
          <div className="container home-panel" style={{ maxWidth: 760 }}>
            {(news as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div className="empty-ico"><SiteIcon k="icon_empty_news" size={30} /></div>
                <p style={{ color: 'var(--text-sub)' }}>{t('news_empty')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {(news as any[]).map((n, i) => (
                  <ScrollReveal key={n.id} delay={(i % 3) * 70}>
                    <article style={{ background: 'var(--white)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 18px rgba(250,135,161,.1)', border: '1px solid var(--border)' }}>
                      {n.image && (
                        <img src={n.image} alt={n.title} loading="lazy" decoding="async" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
                      )}
                      <div style={{ padding: '22px 24px 26px' }}>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginBottom: 8 }}>{new Date(n.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <h2 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 12, lineHeight: 1.3 }}>{n.title}</h2>
                        <p style={{ color: 'var(--text-sub)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{n.content}</p>
                      </div>
                    </article>
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
