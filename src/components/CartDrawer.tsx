'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { X, Minus, Plus, Trash2, ShoppingBag, Send, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { useCart, unitPrice } from '@/lib/cart'
import { formatPrice } from '@/lib/utils'
import { formatUzPhone, uzDigits, isUzComplete, cleanTgUser } from '@/lib/phone'

/**
 * Панель корзины: список позиций с количеством, итог и форма заявки.
 * Заказ уходит одним запросом в /api/order (items[]), оттуда — в Telegram.
 */
export function CartDrawer() {
  const { items, count, total, open, setOpen, setQty, remove, clear } = useCart()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'list' | 'form' | 'done'>('list')
  const [form, setForm] = useState({ name: '', phone: '+998 ', tg: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [phoneErr, setPhoneErr] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, setOpen])
  useEffect(() => { if (open && step === 'done') return; if (open) setStep(items.length ? 'list' : 'list') }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isUzComplete(form.phone)) { setPhoneErr(true); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: form.tg, message: form.message,
          items: items.map(i => ({ productId: i.productId, qty: i.qty, color: i.color || '', size: i.size || '' })),
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('idle'); setStep('done'); clear()
      setForm({ name: '', phone: '+998 ', tg: '', message: '' })
    } catch { setStatus('error') }
  }
  const close = () => { setOpen(false); if (step === 'done') setStep('list') }

  if (!mounted || !open) return null
  const badPhone = phoneErr || (uzDigits(form.phone).length > 3 && !isUzComplete(form.phone))

  return createPortal(
    <div className="cart-overlay" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-label="Корзина">
        <header className="cart-head">
          <div className="cart-title"><ShoppingBag size={20} aria-hidden="true" /> Корзина {count > 0 && <span className="cart-title-count">{count}</span>}</div>
          <button type="button" className="cart-close" onClick={close} aria-label="Закрыть"><X size={18} /></button>
        </header>

        {step === 'done' ? (
          <div className="cart-done">
            <CheckCircle size={56} />
            <h3 className="font-display">Заявка отправлена!</h3>
            <p>Свяжемся с вами в ближайшее время и подтвердим заказ. Спасибо! 🧶</p>
            <button type="button" className="btn-primary" onClick={close}>Продолжить покупки</button>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><ShoppingBag size={28} /></div>
            <h3 className="font-display">Пока пусто</h3>
            <p>Добавьте изделия из каталога — они появятся здесь, и можно будет отправить один заказ на всё сразу.</p>
            <Link href="/catalog" className="btn-primary" onClick={close}>В каталог <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map(i => (
                <div key={i.key} className="cart-item">
                  <Link href={`/product/${i.slug}`} className="cart-thumb" onClick={close} aria-label={i.name}>
                    {i.image ? <img src={i.image} alt="" /> : <span>🧶</span>}
                  </Link>
                  <div className="cart-item-main">
                    <Link href={`/product/${i.slug}`} className="cart-item-name" onClick={close}>{i.name}</Link>
                    {(i.color || i.size) && <div className="cart-item-variant">{[i.color && `Цвет: ${i.color}`, i.size && `Размер: ${i.size}`].filter(Boolean).join(' · ')}</div>}
                    <div className="cart-item-row">
                      <div className="qty" aria-label="Количество">
                        <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Меньше"><Minus size={14} /></button>
                        <span>{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Больше"><Plus size={14} /></button>
                      </div>
                      <div className="cart-item-price">
                        {unitPrice(i) < i.price && <s>{formatPrice(i.price * i.qty)}</s>}
                        <b>{formatPrice(unitPrice(i) * i.qty)}</b>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="cart-remove" onClick={() => remove(i.key)} aria-label="Убрать из корзины"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {step === 'list' ? (
              <footer className="cart-foot">
                <div className="cart-total"><span>Итого</span><b>{formatPrice(total)}</b></div>
                <p className="cart-note">Оплата и доставка обсуждаются после заявки — мы свяжемся с вами.</p>
                <button type="button" className="btn-primary cart-cta" onClick={() => setStep('form')}>Оформить заказ <ArrowRight size={16} /></button>
                <button type="button" className="cart-clear" onClick={() => { if (confirm('Очистить корзину?')) clear() }}>Очистить корзину</button>
              </footer>
            ) : (
              <form className="cart-form" onSubmit={submit}>
                <div className="cart-total"><span>Итого</span><b>{formatPrice(total)}</b></div>
                <label>Ваше имя *<input className="input" required placeholder="Как вас зовут?" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
                <label>Телефон *
                  <input className="input" required inputMode="tel" maxLength={17} placeholder="+998 99 864 81 91" value={form.phone}
                    onChange={e => { setForm({ ...form, phone: formatUzPhone(e.target.value) }); setPhoneErr(false) }}
                    style={badPhone ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.12)' } : undefined} />
                  {badPhone && <span className="cart-err">Введите номер полностью: +998 XX XXX XX XX</span>}
                </label>
                <label>Telegram <small>(по желанию)</small>
                  <span className="cart-tg"><i>@</i><input className="input" placeholder="username" autoComplete="off" autoCapitalize="none" spellCheck={false} value={form.tg} onChange={e => setForm({ ...form, tg: cleanTgUser(e.target.value) })} /></span>
                </label>
                <label>Пожелания<textarea className="input" placeholder="Цвет, размер, сроки, доставка…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
                {status === 'error' && <div className="cart-err-box">Не удалось отправить. Попробуйте ещё раз.</div>}
                <button type="submit" className="btn-primary cart-cta" disabled={status === 'loading'}>
                  {status === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Отправляем…</> : <><Send size={16} /> Отправить заказ</>}
                </button>
                <button type="button" className="cart-clear" onClick={() => setStep('list')}>← Назад к списку</button>
              </form>
            )}
          </>
        )}
      </aside>
    </div>,
    document.body,
  )
}
