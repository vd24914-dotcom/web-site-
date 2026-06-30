'use client'
import { useState } from 'react'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'

// Узбекский номер: +998 XX XXX XX XX (9 цифр после кода 998)
function formatUzPhone(input: string): string {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  d = d.slice(0, 9)
  let out = '+998'
  if (d.length) out += ' ' + d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}
const uzDigits = (p: string) => p.replace(/\D/g, '')
const isUzComplete = (p: string) => uzDigits(p).length === 12

interface Props {
  productId?: number
  productName?: string
  trigger?: React.ReactNode
  settings?: Record<string, string>
}

export function OrderModal({ productId, productName, trigger, settings = {} }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '+998 ', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [phoneErr, setPhoneErr] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isUzComplete(form.phone)) { setPhoneErr(true); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      setForm({ name: '', phone: '+998 ', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const close = () => { setOpen(false); setStatus('idle') }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger || <button className="btn-primary">Оставить заявку</button>}</div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74, 45, 58, 0.28)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) close() }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 460, position: 'relative' }}>
            <button onClick={close} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="var(--text-sub)" />
            </button>

            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} color="var(--green)" style={{ margin: '0 auto 16px' }} />
                <h3 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: 12 }}>Заявка принята!</h3>
                <p style={{ color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 24 }}>
                  Свяжемся с вами в ближайшее время. Спасибо! 🧶
                </p>
                <button className="btn-primary" onClick={close}>Закрыть</button>
              </div>
            ) : (
              <>
                <h3 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: 6 }}>Оставить заявку</h3>
                {productName
                  ? <p style={{ color: 'var(--pink)', fontSize: '.9rem', marginBottom: 20 }}>🧶 {productName}</p>
                  : <p style={{ color: 'var(--text-sub)', fontSize: '.9rem', marginBottom: 20 }}>Обсудим все детали вашего заказа</p>
                }

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Ваше имя *</label>
                    <input className="input" required placeholder="Как вас зовут?" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Телефон *</label>
                    <input
                      className="input"
                      required
                      inputMode="tel"
                      maxLength={17}
                      placeholder="+998 99 864 81 91"
                      value={form.phone}
                      onChange={e => { setForm({ ...form, phone: formatUzPhone(e.target.value) }); setPhoneErr(false) }}
                      style={(phoneErr || (uzDigits(form.phone).length > 3 && !isUzComplete(form.phone))) ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.12)' } : undefined}
                    />
                    {(phoneErr || (uzDigits(form.phone).length > 3 && !isUzComplete(form.phone))) && (
                      <p style={{ color: '#ef4444', fontSize: '.78rem', marginTop: 5 }}>Введите номер полностью: +998 XX XXX XX XX</p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Почта <span style={{ color: 'var(--text-sub)', fontWeight: 400 }}>(по желанию)</span></label>
                    <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Пожелания</label>
                    <textarea className="input" placeholder="Цвет, размер, особые пожелания..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>

                  {status === 'error' && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 10, fontSize: '.85rem' }}>
                      Ошибка отправки. Попробуйте ещё раз.
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={status === 'loading'} style={{ marginTop: 4 }}>
                    {status === 'loading'
                      ? <><Loader2 size={16} className="animate-spin" /> Отправляем...</>
                      : <><Send size={16} /> Отправить заявку</>
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
