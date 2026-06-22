'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/admin/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    })
    if (res.ok) window.location.href = '/admin'
    else { setError('Неверный email или пароль'); setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,var(--cream) 0%,var(--pink-light) 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--white)', borderRadius:22, padding:44, width:'100%', maxWidth:400, boxShadow:'0 12px 48px rgba(250,135,161,.2)', border:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:34 }}>
          <div style={{ fontSize:52, marginBottom:10 }}>🧶</div>
          <h1 className="font-display" style={{ fontSize:'1.8rem', color:'var(--text)', marginBottom:4 }}>Fimush.kin</h1>
          <p style={{ color:'var(--text-sub)', fontSize:'.9rem' }}>Панель управления</p>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:10, fontSize:'.85rem' }}>{error}</div>}
          <div>
            <label style={{ display:'block', fontWeight:600, color:'var(--text)', marginBottom:7, fontSize:'.875rem' }}>Email</label>
            <input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@uyutnit.uz"/>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, color:'var(--text)', marginBottom:7, fontSize:'.875rem' }}>Пароль</label>
            <input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:10, justifyContent:'center' }}>
            {loading ? <><Loader2 size={16} className="animate-spin"/> Входим...</> : 'Войти в панель'}
          </button>
        </form>
      </div>
    </div>
  )
}
