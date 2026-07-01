export const revalidate = 3600
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { parseJSON, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderModal } from '@/components/OrderModal'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ProductGallery } from '@/components/ProductGallery'
import { PriceTag } from '@/components/PriceTag'
import { SaleCountdown } from '@/components/SaleCountdown'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

async function getSettings(): Promise<Record<string,string>> {
  const rows = await prisma.siteSettings.findMany().catch(()=>[])
  return Object.fromEntries((rows as any[]).map((r:any)=>[r.key,r.value]))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await prisma.product.findUnique({ where: { slug } }).catch(()=>null)
  if (!p) return { title: 'Товар не найден' }
  const imgs = parseJSON((p as any).images||'[]')
  return {
    title: (p as any).metaTitle || p.name,
    description: (p as any).metaDesc || p.description.slice(0,160),
    openGraph: { title: p.name, images: imgs[0] ? [{ url: imgs[0] }] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where:{ slug }, include:{ category: true } }).catch(()=>null),
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
              <ProductGallery images={images} emoji={(product as any).category?.emoji} name={product.name} />
            </ScrollReveal>

            <ScrollReveal direction="right">
              <span className="badge badge-rose" style={{ marginBottom:14 }}>{(product as any).category?.emoji} {(product as any).category?.name}</span>
              <h1 className="font-display" style={{ fontSize:'2rem', color:'var(--text)', marginBottom:14, lineHeight:1.28 }}>{product.name}</h1>
              <div style={{ marginBottom:18 }}>
                <PriceTag price={product.price} onSale={(product as any).onSale} salePrice={(product as any).salePrice} size="lg" />
              </div>
              {(product as any).onSale && (product as any).salePrice && <SaleCountdown end={(product as any).saleEnd} />}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22, color:product.inStock?'#2e7d45':'#e53e3e' }}>
                <CheckCircle size={18}/>
                <span style={{ fontWeight:600 }}>{product.inStock?'В наличии':'Под заказ (7-14 дней)'}{(product as any).quantity != null ? ` · осталось ${(product as any).quantity} шт` : ''}</span>
              </div>
              <div style={{ fontWeight:600, color:'var(--text)', marginBottom:10, fontSize:'.95rem' }}>Описание</div>
              <p style={{ color:'var(--text-sub)', lineHeight:1.8, marginBottom:26, fontSize:'1rem', whiteSpace:'pre-line' }}>{product.description}</p>

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
              {(product as any).videoUrl && (
                <a href={(product as any).videoUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:12, padding:'.95rem', borderRadius:14, background:'var(--pink-light)', color:'var(--pink-dark)', fontWeight:600, textDecoration:'none', border:'1px solid var(--border)', fontSize:'.95rem' }}>
                  🎬 Смотреть видео
                </a>
              )}
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
