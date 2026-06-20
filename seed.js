const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@uyutnit.uz'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 12)

  // Create admin
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, passwordHash: hash },
  })
  console.log('✅ Администратор создан:', email)

  // Delete all old products and categories to start fresh
  await prisma.order.updateMany({ data: { productId: null } })
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('🗑️  Старые данные удалены')

  // Create categories (Russian)
  const cats = await prisma.category.createMany({
    data: [
      { name: 'Свитеры', slug: 'svitery', emoji: '🧥', sortOrder: 1 },
      { name: 'Шапки и шарфы', slug: 'shapki', emoji: '🧣', sortOrder: 2 },
      { name: 'Игрушки', slug: 'igrushki', emoji: '🐻', sortOrder: 3 },
      { name: 'Пледы', slug: 'pledy', emoji: '🛋️', sortOrder: 4 },
      { name: 'Носки и варежки', slug: 'noski', emoji: '🧤', sortOrder: 5 },
      { name: 'Сумки', slug: 'sumki', emoji: '👜', sortOrder: 6 },
    ]
  })
  console.log('📁 Категории созданы')

  const sviter = await prisma.category.findUnique({ where: { slug: 'svitery' } })
  const shapka = await prisma.category.findUnique({ where: { slug: 'shapki' } })
  const toy = await prisma.category.findUnique({ where: { slug: 'igrushki' } })

  // Create sample products
  await prisma.product.createMany({
    data: [
      {
        name: 'Свитер «Северный уют»',
        slug: 'sviter-severny-uyut',
        description: 'Тёплый свитер оверсайз из мериносовой шерсти. Идеален для холодных вечеров. Вяжется на заказ в любом цвете.',
        price: 450000,
        categoryId: sviter.id,
        colors: JSON.stringify(['Молочный', 'Серый', 'Бежевый', 'Терракотовый']),
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        featured: true,
        images: JSON.stringify([]),
      },
      {
        name: 'Шапка «Помпончик»',
        slug: 'shapka-pompochik',
        description: 'Уютная зимняя шапка с большим помпоном из натурального меха. Подходит для взрослых и детей.',
        price: 120000,
        categoryId: shapka.id,
        colors: JSON.stringify(['Белый', 'Розовый', 'Горчичный', 'Серый']),
        sizes: JSON.stringify(['Взрослый', 'Детский']),
        featured: true,
        images: JSON.stringify([]),
      },
      {
        name: 'Мишка Тедди вязаный',
        slug: 'mishka-teddi',
        description: 'Милый вязаный мишка Тедди — идеальный подарок для детей и взрослых. Высота 25 см, гипоаллергенный наполнитель.',
        price: 180000,
        categoryId: toy.id,
        colors: JSON.stringify(['Бежевый', 'Белый', 'Коричневый']),
        sizes: JSON.stringify(['25 см', '35 см']),
        featured: true,
        images: JSON.stringify([]),
      },
    ]
  })
  console.log('📦 Тестовые товары созданы')

  console.log('\n🎉 Всё готово!')
  console.log('📧 Email:', email)
  console.log('🔑 Пароль:', password)
  console.log('🌐 Сайт: http://localhost:3000')
  console.log('⚙️  Админка: http://localhost:3000/admin/login')
}

main()
  .catch(e => { console.error('❌ Ошибка:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
