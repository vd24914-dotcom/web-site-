import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SiteBackground } from '@/components/SiteBackground'
import { CartProvider } from '@/lib/cart'
import { CartDrawer } from '@/components/CartDrawer'
import { getSettings } from '@/lib/settings'
import { SettingsProvider } from '@/components/SiteText'

export const metadata: Metadata = {
  title: { default: 'Fimush.kin — Вязаные изделия ручной работы | Toshkent', template: '%s | Fimush.kin' },
  description: 'Вязаные изделия ручной работы в Ташкенте. Свитеры, шапки, пледы, игрушки. Индивидуальные заказы по всему Узбекистану.',
  keywords: ['вязаные изделия', 'ручная работа', 'Ташкент', 'Узбекистан', 'вязание', 'свитер', 'шапка'],
  openGraph: { type: 'website', locale: 'ru_UZ', siteName: 'Fimush.kin' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Fimush.kin' },
  icons: { icon: '/icon-192.png', shortcut: '/icon-192.png', apple: '/apple-icon-180.png' },
}

export const viewport: Viewport = {
  themeColor: '#211722',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')}catch(e){}document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});document.addEventListener('gesturechange',function(e){e.preventDefault()},{passive:false});var _ld=0;document.addEventListener('touchend',function(e){var n=Date.now();if(n-_ld<=320){e.preventDefault()}_ld=n},{passive:false});` }} />
      </head>
      <body><SettingsProvider settings={await getSettings()}><CartProvider><SiteBackground />{children}<CartDrawer /><ScrollToTop /></CartProvider></SettingsProvider></body>
    </html>
  )
}
