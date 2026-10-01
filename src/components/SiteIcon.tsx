'use client'
import type { CSSProperties, ComponentType } from 'react'
import {
  Phone, Send, Mail, MapPin, HeartHandshake, PencilRuler, Award, Truck, ShoppingBag, Check, Zap, Play,
  PackageOpen, Star, Tag, SearchX, Newspaper, CheckCircle, CheckCircle2,
} from 'lucide-react'
import { useSettings } from './SiteText'
import { IG, WA, FB, YT } from '@/lib/brand-icons'

type IconProps = { size?: number; className?: string; style?: CSSProperties; color?: string }

const brand = (d: string): ComponentType<IconProps> => {
  const Brand = ({ size = 18, className, style }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} style={style}><path d={d} /></svg>
  )
  return Brand
}

/** Стандартные иконки сайта: ключ настройки → иконка, если в админке не загружена своя */
export const ICON_DEFAULTS: Record<string, ComponentType<IconProps>> = {
  benefit1_icon: HeartHandshake, benefit2_icon: PencilRuler, benefit3_icon: Award, benefit4_icon: Truck,
  icon_cart: ShoppingBag, icon_cart_empty: ShoppingBag, icon_add: ShoppingBag, icon_added: Check, icon_oneclick: Zap,
  icon_video: Play, icon_send: Send, icon_done: CheckCircle, icon_back_in_stock: CheckCircle2,
  icon_phone: Phone, icon_telegram: Send, icon_email: Mail, icon_address: MapPin,
  icon_instagram: brand(IG), icon_whatsapp: brand(WA), icon_facebook: brand(FB), icon_youtube: brand(YT),
  icon_empty_catalog: PackageOpen, icon_empty_picks: Star, icon_empty_sale: Tag, icon_notfound: SearchX,
  icon_empty_news: Newspaper, icon_search_start: PackageOpen,
}

/**
 * Иконка, которую можно заменить в админке («Контент сайта»).
 * Загружена картинка — показываем её, иначе стандартную иконку.
 */
export function SiteIcon({ k, size = 18, className, style, color, src }: IconProps & { k: string; src?: string }) {
  const settings = useSettings()
  const url = (src ?? settings[k] ?? '').trim()
  if (url) {
    return <img src={url} alt="" aria-hidden="true" width={size} height={size} className={`site-ico${className ? ' ' + className : ''}`}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, display: 'inline-block', ...style }} />
  }
  const D = ICON_DEFAULTS[k]
  return D ? <D size={size} className={className} style={style} color={color} /> : null
}
