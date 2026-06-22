import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ScrollToTop } from '@/components/ScrollToTop'

export const metadata: Metadata = {
  title: { default: 'Fimush.kin — Вязаные изделия ручной работы | Toshkent', template: '%s | Fimush.kin' },
  description: 'Вязаные изделия ручной работы в Ташкенте. Свитеры, шапки, пледы, игрушки. Индивидуальные заказы по всему Узбекистану.',
  keywords: ['вязаные изделия', 'ручная работа', 'Ташкент', 'Узбекистан', 'вязание', 'свитер', 'шапка'],
  openGraph: { type: 'website', locale: 'ru_UZ', siteName: 'Fimush.kin' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBar