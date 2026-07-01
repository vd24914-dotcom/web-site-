// Восстановление контента из content-backup.json в базу
// Запуск: node restore.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

const clean = (o) => { const { createdAt, updatedAt, ...rest } = o; return rest }

async function main() {
  if (!fs.existsSync('content-backup.json')) {
    console.error('Нет файла content-backup.json — сначала запусти node backup.js')
    process.exit(1)
  }
  const data = JSON.parse(fs.readFileSync('content-backup.json', 'utf8'))

  for (const s of data.siteSettings || []) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } })
  }
  for (const c of data.categories || []) {
    await prisma.category.upsert({ where: { id: c.id }, update: clean(c), create: clean(c) })
  }
  for (const p of data.products || []) {
    await prisma.product.upsert({ where: { id: p.id }, update: clean(p), create: clean(p) })
  }
  for (const n of data.news || []) {
    await prisma.news.upsert({ where: { id: n.id }, update: clean(n), create: clean(n) })
  }

  console.log('✅ Контент восстановлен из content-backup.json')
  await prisma.$disconnect()
}

main().catch(e => { console.error('Ошибка:', e); process.exit(1) })
