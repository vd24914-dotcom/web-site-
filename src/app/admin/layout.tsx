import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut, Palette, Newspaper } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="force-light" style={{ display:'flex', minHeight:'100vh', background:'var(--cream)' }}>
      <aside style={{ width:234, background:'var(--white)', borderRight:'1px solid var(--border)', padding:'24px 14px', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0, overflowY:'auto' }}>
        <div style={{ padding:'8px 6px 22px', borderBottom:'1px solid var(--border)', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:24 }}>🧶</span>
            <span className="font-display" style={{ fontSize:'1.1rem', color:'var(--text)', fontWeight:700 }}>УютНить</span>
          </div>
          <div style={{ fontSize:'.72rem', color:'var(--text-sub)', marginTop:4, paddingLeft:34 }}>Панель управления</div>
        </div>
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
          {[
            { href:'/admin',             icon:<LayoutDashboard size={17}/>, label:'Главная'          },
            { href:'/admin/orders',      icon:<ShoppingBag    size={17}/>, label:'Заявки'            },
            { href:'/admin/products',    icon:<Package        size={17}/>, label:'Товары'            },
            { href:'/admin/categories',  icon:<Tag            size={17}/>, label:'Категории'         },
            { href:'/admin/news',        icon:<Newspaper      size={17}/>, label:'Новости'           },
            { href:'/admin/appearance',  icon:<Palette        size={17}/>, label:'Дизайн и контент'  },
            { href:'/admin/settings',    icon:<Settings       size={17}/>, label:'Настройки'         },
          ].map(item => (
            <Link key={item.href} href={item.href} className="admin-link">{item.icon} {item.label}</Link>
          ))}
        </nav>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
          <form action="/api/admin/auth/logout" method="POST">
            <button type="submit" className="admin-link" style={{ color:'var(--pink-dark)' }}>
              <LogOut size={17}/> Выйти
            </button>
          </form>
        </div>
      </aside>
      <main style={{ flex:1, marginLeft:234, overflow:'auto', minHeight:'100vh', background:'var(--cream)' }}>
        {children}
      </main>
    </div>
  )
}
