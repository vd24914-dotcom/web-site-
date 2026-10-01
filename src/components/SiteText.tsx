'use client'
import { createContext, useContext, useMemo } from 'react'
import { makeT } from '@/lib/content'

const SettingsContext = createContext<Record<string, string>>({})

/** Настройки сайта для клиентских компонентов (кладётся в корневом layout) */
export function SettingsProvider({ settings, children }: { settings: Record<string, string>; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)

/** t('ключ', { n: 3 }) — текст из админки или стандартный */
export function useT() {
  const settings = useContext(SettingsContext)
  return useMemo(() => makeT(settings), [settings])
}

/** Текст из админки внутри разметки (в т.ч. в серверных компонентах) */
export function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const t = useT()
  return <>{t(k, vars)}</>
}
