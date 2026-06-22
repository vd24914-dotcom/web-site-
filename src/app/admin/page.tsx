export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { ShoppingBag, Package, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [ordersTotal, ordersNew, products, categories] = await Promise.all([
    prisma.order.count().catch(()=>0),
    prisma.order.count({ where:{ status:'new' } }).catch(()=>0),
    prisma.product.count().catch(()=>0),
    prisma.category.count().catch(()=>0),
  ])
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, take: 8, include: { product: true }
  }).catch(()=>[])

  const STATUS: Record<string,string> = { new:'Новая', processing:'В работе', done:'Выполнена', cancelled:'Отменена' }
  const SC: Record<string,string> = { new:'status-new', processing:'status-processing', done:'status-done', cancelled:'status-cancelled' }

  return (
    <div style={{ padding: 32 }}>
      <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6 }}>Главная</h1>
      <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: '.9rem' }}>Обзор магазина Fimush.kin</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 40 }}>
        {[
          { icon: <ShoppingBag size={22} color="var(--pink)"/>, label: 'Всего заявок',   value: ordersTotal, sub: `${ordersNew} новых`,    href: '/admin/orders'    },
          { icon: <Package     size={22} color="var(--pink)"/>, label: 'Товаров',         value: products,    sub: 'в каталоге',             href: '/admin/products'  },
          { icon: <Tag         size={22} color="var(--pink)"/>, label: 'Категорий',       value: categories,  sub: 'разделов',               href: '/admin/categories'},
          { icon: <TrendingUp  size={22} color="var(--pink)"/>, label: 'Новых заявок',   value: ordersNew,   sub: 'ожидают ответа',         href: '/admin/orders'    },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="stat-card">
            <div style={{ width: 44, height: 44, background: 'var(--pink-mist)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--border)' }}>
              {stat.icon}
            </div>
            <div className="font-display" style={{ fontSize: '2rem', color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>{stat.label}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--pink)', marginTop: 3, fontWeight: 600 }}>{stat.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', boxShadow: '0 2px 14px rgba(250,135,161,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Последние заявки</h2>
          <Link href="/admin/orders" style={{ color: 'var(--pink)', textDecoration: 'none', fontSize: '.85rem', fontWeight: 600 }}>Все заявки →</Link>
        </div>

        {(recentOrders as any[]).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📬</div>
            <p style={{ color: 'var(--text-sub)', fontSize: '.9rem' }}>Заявок пока нет</p>
          </div>
        ) : (recentOrders as any[]).map((order: any) => (
          <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9rem' }}>{order.name}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: '.8rem' }}>{order.phone}</div>
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {order.product?.name || 'Общая заявка'}
            </div>
            <span className={`badge ${SC[order.status]}`} style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>
              {STATUS[order.status] || order.status}
            </span>
            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </div>
          </div>
        ))}
      </div>

      <style>{`.stat-card{display:block;text-decoration:none}`}</style>
    </div>
  )
}
