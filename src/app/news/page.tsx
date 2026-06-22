export const revalidate = 600
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Новости — УютНить',
  description: 'Новости, новинки и обновления мастерской УютНить.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  return Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
}

export default async function NewsPage() {
  const [settings, news] = await Promise.all([
    getSettings(),
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])

  return (
    <>
      <Header settings={settings} />
      <main>
        <section className="gradient-flow" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--pink-mist) 50%, var(--pink-light) 100%)', padding: '56px 0 36px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="badge badge-rose" style={{ marginBottom: 14 }}>📰 Лента</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--text)', marginBottom: 10 }}>Новости</h1>
            <p style={{ color: 'var(--text-sub)' }}>Новинки, акции и обновления мастерской</p>
          </div>
        </section>

        <section style={{ padding: '40px 0 80px', background: 'var(--white)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            {(news as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
                <p style={{ color: 'var(--text-sub)' }}>Новостей пока нет. Загляните позже!</p>
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
