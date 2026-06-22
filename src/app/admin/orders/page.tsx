'use client'
import { useState, useEffect } from 'react'
import { RefreshCw, Phone, MessageSquare } from 'lucide-react'

const STATUS: Record<string,string> = { new:'Новая', processing:'В работе', done:'Выполнена', cancelled:'Отменена' }
const SC: Record<string,string> = { new:'status-new', processing:'status-processing', done:'status-done', cancelled:'status-cancelled' }

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => { setLoading(true); const r=await fetch('/api/admin/orders'); const d=await r.json(); setOrders(d.orders||[]); setLoading(false) }
  useEffect(()=>{load()},[])

  const changeStatus = async (id:number, status:string) => {
    await fetch('/api/admin/orders',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o))
  }

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <div>
          <h1 className="font-display" style={{fontSize:'1.8rem',color:'var(--text)'}}>Заявки</h1>
          <p style={{color:'var(--text-sub)',fontSize:'.9rem'}}>{orders.length} заявок всего</p>
        </div>
        <button onClick={load} className="btn-outline" style={{padding:'.6rem 1rem',fontSize:'.85rem',display:'flex',alignItems:'center',gap:6}}>
          <RefreshCw size={16}/> Обновить
        </button>
      </div>

      {loading ? <div style={{textAlign:'center',padding:60}}><RefreshCw size={32} className="animate-spin" style={{color:'var(--pink)',margin:'0 auto'}}/></div>
      : orders.length===0 ? <div style={{textAlign:'center',padding:60}}><div style={{fontSize:48,marginBottom:12}}>📬</div><p style={{color:'var(--text-sub)'}}>Заявок пока нет</p></div>
      : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {orders.map((order:any)=>(
            <div key={order.id} style={{background:'white',borderRadius:16,padding:24,border:`2px solid ${order.status==='new'?'var(--pink-light)':'var(--border)'}`,boxShadow:'0 2px 12px rgba(93,61,46,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                    <span className="font-display" style={{fontSize:'1.1rem',color:'var(--text)',fontWeight:600}}>{order.name}</span>
                    <span className={`badge ${SC[order.status]}`}>{STATUS[order.status]}</span>
                    {order.status==='new'&&<span style={{background:'var(--pink)',color:'white',borderRadius:20,padding:'2px 8px',fontSize:'.7rem',fontWeight:700}}>НОВАЯ</span>}
                  </div>
                  <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--text-sub)',fontSize:'.85rem'}}><Phone size={14}/> {order.phone}</div>
                    {order.email&&<div style={{color:'var(--text-sub)',fontSize:'.85rem'}}>✉️ {order.email}</div>}
                    {order.product&&<div style={{color:'var(--pink)',fontSize:'.85rem',fontWeight:500}}>🧶 {order.product.name}</div>}
                  </div>
                  {order.message&&(
                    <div style={{background:'var(--cream-dark)',borderRadius:10,padding:'10px 14px',fontSize:'.85rem',color:'var(--text-sub)',display:'flex',gap:8}}>
                      <MessageSquare size={14} style={{flexShrink:0,marginTop:2}}/>{order.message}
                    </div>
                  )}
                  <div style={{fontSize:'.75rem',color:'var(--text-sub)',marginTop:8}}>{new Date(order.createdAt).toLocaleString('ru-RU')}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,minWidth:130}}>
                  <div style={{fontSize:'.75rem',color:'var(--text-sub)',fontWeight:600,marginBottom:4}}>Статус:</div>
                  {Object.entries(STATUS).map(([val,label])=>(
                    <button key={val} onClick={()=>changeStatus(order.id,val)}
                      style={{padding:'6px 12px',borderRadius:8,border:'1px solid',fontSize:'.8rem',cursor:'pointer',fontWeight:500,transition:'all .15s',
                        background:order.status===val?'var(--pink)':'transparent',
                        borderColor:order.status===val?'var(--pink)':'var(--border)',
                        color:order.status===val?'white':'var(--text-sub)'}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
