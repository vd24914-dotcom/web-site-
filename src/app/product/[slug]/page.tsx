export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

async function getSettings(): Promise<Record<string,string>> {
  const rows = await prisma.siteSettings.findMany().catch(()=>[])
  return Object.fromEntries((rows as any[]).map((r:any)=>[r.key,r.value]))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } }).catch(()=>null)
  if (!p) return { title: 'Товар не найден' }
  const imgs = parseJSON((p as any).images||'[]')
  return {
    title: (p as any).metaTitle || p.name,
    description: (p as any).metaDesc || p.description.slice(0,160),
    openGraph: { title: p.name, images: imgs[0] ? [{ url: imgs[0] }] : [] },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where:{ slug: params.slug }, include:{ category: true } }).catch(()=>null),
    getSettings(),
  ])
  if (!product) notFound()

  const images = parseJSON((product as any).images||'[]')
  const colors = parseJSON((product as any).colors||'[]')
  const sizes  = parseJSON((product as any).sizes||'[]')

  return (
    <>
      <Header settings={settings} />
      <main>
        <div className="container" style={{ paddingTop: 36, paddingBottom: 88 }}>
          <Link href="/catalog" className="back-link">
            <ArrowLeft size={16}/> Назад в каталог
          </Link>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <ScrollReveal direction="left">
              <div style={{ height:420, background:images[0]?'transparent':'linear-gradient(135deg,var(--pink-light),var(--cream-dark))', borderRadius:22, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:108, marginBottom:14, boxShadow:'0 12px 40px rgba(250,135,161,.15)' }}>
                {images[0]
                  ? <img src={images[0]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : (product as any).category?.emoji||'🧶'
                }
              </div>
              {images.length > 1 && (
                <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
                  {images.map((img:string, i:number)=>(
                    <div key={i} className={`thumb ${i===0?'thumb-active':''}`} style={{ width:80, height:80, flexShrink:0 }}>
                      <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>

            <ScrollReveal direction="right">
              <span className="badge badge-rose" style={{ marginBottom:14 }}>{(product as any).category?.emoji} {(product as any).category?.name}</span>
              <h1 className="font-display" style={{ fontSize:'2rem', color:'var(--text)', marginBottom:14, lineHeight:1.28 }}>{product.name}</h1>
              <div className="font-display" style={{ fontSize:'2rem', color:'var(--pink)', fontWeight:700, marginBottom:18 }}>{formatPrice(product.price)}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22, color:product.inStock?'#2e7d45':'#e53e3e' }}>
                <CheckCircle size={18}/>
                <span style={{ fontWeight:600 }}>{product.inStock?'В наличии':'Под заказ (7-14 дней)'}</span>
              </div>
              <p style={{ color:'var(--text-sub)', lineHeight:1.8, marginBottom:26, fontSize:'1rem' }}>{product.description}</p>

              {colors.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontWeight:600, color:'var(--text)', marginBottom:10, fontSize:'.9rem' }}>Цвета:</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {colors.map((c:string)=><span key={c} className="badge badge-gray">{c}</span>)}
                  </div>
                </div>
              )}
              {sizes.length > 0 && (
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontWeight:600, color:'var(--text)', marginBottom:10, fontSize:'.9rem' }}>Размеры:</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {sizes.map((s:string)=><span key={s} className="badge badge-gray">{s}</span>)}
                  </div>
                </div>
              )}

              <OrderModal productId={(product as any).id} productName={product.name} settings={settings} trigger={
                <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'1rem', fontSize:'1rem' }}>
                  🧶 Заказать это изделие
                </button>
              }/>
              <div style={{ marginTop:16, padding:'14px 18px', background:'var(--pink-mist)', borderRadius:14, fontSize:'.85rem', color:'var(--text-sub)', lineHeight:1.65, border:'1px solid var(--border)' }}>
                💬 После заявки свяжусь с вами и обсудим все детали.
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer settings={settings}/>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
