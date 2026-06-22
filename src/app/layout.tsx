import type { Metadata } from 'next'
import './globals.css'
import { ScrollToTop } from '@/components/ScrollToTop'

export const metadata: Metadata = {
  title: { default: 'УютНить — Вязаные изделия ручной работы | Toshkent', template: '%s | УютНить' },
  description: 'Вязаные изделия ручной работы в Ташкенте. Свитеры, шапки, пледы, игрушки. Индивидуальные заказы по всему Узбекистану.',
  keywords: ['вязаные изделия', 'ручная работа', 'Ташкент', 'Узбекистан', 'вязание', 'свитер', 'шапка'],
  openGraph: { type: 'website', locale: 'ru_UZ', siteName: 'УютНить' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}<ScrollToTop /></body></html>
}
