import Link from 'next/link'
interface Props { settings?: Record<string, string> }
export function Footer({ settings = {} }: Props) {
  const siteName = settings.site_name || 'УютНить'
  const showText = settings.logo_show_text !== '0'
  return (
    <footer style={{ background: 'linear-gradient(135deg,#FA87A1 0%,#e06080 100%)', color: 'rgba(255,255,255,.9)', padding: '56px 0 28px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 44 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {settings.logo_image
                ? <img src={settings.logo_image} alt={siteName} style={{ height: showText ? 36 : 50, width: 'auto', maxWidth: showText ? 140 : 210, objectFit: 'contain', borderRadius: 8 }} />
                : <span style={{ fontSize: showText ? 26 : 38 }}>{settings.logo_emoji || '🧶'}</span>
              }
              {showText && <span className="font-display" style={{ fontSize: '1.25rem', color: 'var(--white)', fontWeight: 700 }}>{siteName}</span>}
            </div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.65, opacity: .85 }}>{settings.footer_text || 'Вязаные изделия ручной работы с любовью'}</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--white)', marginBottom: 16, fontWeight: 600 }}>Каталог</h4>
            {[['Все товары','/catalog'],['Свитеры','/catalog?category=svitery'],['Шапки','/catalog?category=shapki'],['Игрушки','/catalog?category=igrushki']].map(([l,h])=>(
              <div key={h} style={{ marginBottom: 10 }}>
                <Link href={h} className="footer-link">{l}</Link>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'var(--white)', marginBottom: 16, fontWeight: 600 }}>Контакты</h4>
            <p style={{ fontSize: '.875rem', marginBottom: 10, opacity: .85 }}>📱 {settings.contact_phone || '+998 90 000-00-00'}</p>
            <p style={{ fontSize: '.875rem', marginBottom: 10, opacity: .85 }}>💬 Telegram: {settings.contact_telegram || '@uyutnit'}</p>
            <p style={{ fontSize: '.875rem', opacity: .85 }}>📍 {settings.contact_address || 'Ташкент, Узбекистан'}</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '.8rem', opacity: .65 }}>© 2024 {siteName}. Все права защищены.</p>
          <p style={{ fontSize: '.8rem', opacity: .65 }}>Изделия ручной работы 🧶 Узбекистан</p>
        </div>
      </div>
    </footer>
  )
}
