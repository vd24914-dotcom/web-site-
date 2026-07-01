// Экспорт контента сайта в файл content-backup.json
// Запуск: node backup.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
  const [categories, products, siteSettings, news] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.siteSettings.findMany(),
    prisma.news.findMany().catch(() => []),
  ])

  const data = {
    exportedAt: new Date().toISOString(),
    categories,
    products,
    siteSettings,
    news,
  }

  fs.writeFileSync('content-backup.json', JSON.stringify(data, null, 2))
  console.log(`✅ Бэкап сохранён в content-backup.json`)
  console.log(`   Категорий: ${categories.length}, Товаров: ${products.length}, Настроек: ${siteSettings.length}, Новостей: ${news.length}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error('Ошибка:', e); process.exit(1) })
