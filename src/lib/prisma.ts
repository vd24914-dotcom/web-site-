let _prisma: any = null
function getPrisma() {
  if (_prisma) return _prisma
  try {
    const { PrismaClient } = require('@prisma/client')
    const g = globalThis as any
    if (!g._p) g._p = new PrismaClient()
    _prisma = g._p
  } catch {
    const m = () => ({ findMany: async () => [], findFirst: async () => null, findUnique: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}), count: async () => 0, upsert: async () => ({}) })
    _prisma = { admin: m(), category: m(), product: m(), order: m(), siteSettings: m() }
  }
  return _prisma
}
export const prisma = new Proxy({} as any, { get: (_, p) => getPrisma()[p] })
