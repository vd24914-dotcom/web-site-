import Link from 'next/link'
import { SocialLinks } from './SocialLinks'
import { prisma } from '@/lib/prisma'
interface Props { settings?: Record<string, string> }
export async function Footer({ settings = {} }: Props) {
  const siteName = settings.site_name || 'Fimush.kin'
  const showText = settings.logo_show_text !== '0'
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => [])
  return (
    <footer style={{ background: 'var(--white)', color: 'var(--text-sub)', padding: '56px 0 28px', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 44 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {settings.logo_image
                ? <img src={settings.logo_image} alt={siteName} style={{ height: showText ? 36 : 50, width: 'auto', maxWidth: showText ? 140 : 210, objectFit: 'contain', borderRadius: 8 }} />
                : <span style={{ fontSize: showText ? 26 : 38 }}>{settings.logo_emoji || '🧶'}</span>
              }
              {showText && <span className="font-display" style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700 }}>{siteName}</span>}
            </div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.65, opacity: .85, marginBottom: 16 }}>{settings.footer_text || 'Вязаные изделия ручной работы с любовью'}</p>
            <SocialLinks settings={settings} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', marginBottom: 16, fontWeight: 600 }}>Каталог</h4>
            <div style={{ marginBottom: 10 }}>
              <Link href="/catalog" className="footer-link">Все товары</Link>
            </div>
            {(cats as any[]).map(c => (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <Link href={`/catalog?category=${c.slug}`} className="footer-link">{c.name}</Link>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', marginBottom: 16, fontWeight: 600 }}>Контакты</h4>
            <p style={{ fontSize: '.875rem', marginBottom: 10, opacity: .85 }}>📱 {settings.contact_phone || '+998 90 000-00-00'}</p>
            <p style={{ fontSize: '.875rem', marginBottom: 10, opacity: .85 }}>💬 Telegram: {settings.contact_telegram || '@uyutnit'}</p>
            <p style={{ fontSize: '.875rem', opacity: .85 }}>📍 {settings.contact_address || 'Ташкент, Узбекистан'}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
