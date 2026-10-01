import { SiteIcon } from '@/components/SiteIcon'
import { IG } from '@/lib/brand-icons'

interface Props { settings?: Record<string, string>; size?: number }

const Svg = ({ s, d }: { s: number; d: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
)


export function SocialLinks({ settings = {}, size = 18 }: Props) {
  const v = (k: string) => (settings[k] || '').trim()
  const handle = (base: string, val: string) => val.startsWith('http') ? val : base + val.replace(/^@/, '')

  const items: { href: string; icon: React.ReactNode; label: string; bg: string }[] = []
  if (v('contact_phone')) items.push({ href: 'tel:' + v('contact_phone').replace(/[^\d+]/g, ''), icon: <SiteIcon k="icon_phone" size={size} />, label: 'Телефон', bg: '#3aa760' })
  if (v('contact_telegram')) items.push({ href: handle('https://t.me/', v('contact_telegram')), icon: <SiteIcon k="icon_telegram" size={size} />, label: 'Telegram', bg: '#229ED9' })
  if (v('social_instagram')) items.push({ href: handle('https://instagram.com/', v('social_instagram')), icon: <SiteIcon k="icon_instagram" size={size} />, label: 'Instagram', bg: '#E1306C' })
  if (v('social_whatsapp')) items.push({ href: v('social_whatsapp').startsWith('http') ? v('social_whatsapp') : 'https://wa.me/' + v('social_whatsapp').replace(/[^\d]/g, ''), icon: <SiteIcon k="icon_whatsapp" size={size} />, label: 'WhatsApp', bg: '#25D366' })
  if (v('social_facebook')) items.push({ href: handle('https://facebook.com/', v('social_facebook')), icon: <SiteIcon k="icon_facebook" size={size} />, label: 'Facebook', bg: '#1877F2' })
  if (v('social_youtube')) items.push({ href: handle('https://youtube.com/', v('social_youtube')), icon: <SiteIcon k="icon_youtube" size={size} />, label: 'YouTube', bg: '#FF0000' })
  if (v('contact_email')) items.push({ href: 'mailto:' + v('contact_email'), icon: <SiteIcon k="icon_email" size={size} />, label: 'Email', bg: '#8a5068' })

  if (!items.length) return null
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {items.map(it => (
        <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.label} title={it.label}
          style={{ width: 40, height: 40, borderRadius: '50%', background: it.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          {it.icon}
        </a>
      ))}
    </div>
  )
}

/** Иконка Instagram для использования вне списка соцсетей */
export function InstagramIcon({ size = 16 }: { size?: number }) {
  return <Svg s={size} d={IG} />
}
