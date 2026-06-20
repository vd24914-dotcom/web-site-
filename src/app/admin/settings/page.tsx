'use client'
import { useState } from 'react'
import { CheckCircle, Copy } from 'lucide-react'

export default function SettingsPage() {
  const [copied, setCopied] = useState('')

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: 8 }}>Настройки</h1>
      <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: '.9rem' }}>Технические настройки сайта</p>

      {/* Telegram */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          🤖 Telegram-уведомления
        </h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '.875rem', marginBottom: 20 }}>
          Получайте уведомление в Telegram при каждой новой заявке
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: '1', text: 'Напишите', link: 'https://t.me/BotFather', linkText: '@BotFather', after: 'в Telegram → команда /newbot → получите токен' },
            { step: '2', text: 'Напишите вашему боту любое сообщение (например /start)' },
            { step: '3', text: 'Узнайте ваш Chat ID через', link: 'https://t.me/userinfobot', linkText: '@userinfobot' },
            { step: '4', text: 'Откройте файл .env.local и вставьте токен и Chat ID' },
            { step: '5', text: 'Перезапустите сервер: остановите Ctrl+C и запустите npm run dev' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pink-light)', color: 'var(--pink-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, flexShrink: 0 }}>
                {item.step}
              </div>
              <p style={{ fontSize: '.875rem', color: 'var(--text-sub)', lineHeight: 1.6, paddingTop: 4 }}>
                {item.text}{' '}
                {item.link && <a href={item.link} target="_blank" style={{ color: 'var(--pink)', fontWeight: 600 }}>{item.linkText}</a>}
                {item.after && ' ' + item.after}
              </p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '16px 20px', marginTop: 20, position: 'relative' }}>
          <button onClick={() => copy('TELEGRAM_BOT_TOKEN=ваш_токен_здесь\nTELEGRAM_CHAT_ID=ваш_chat_id', 'tg')}
            style={{ position: 'absolute', top: 12, right: 12, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-sub)' }}>
            {copied === 'tg' ? <><CheckCircle size={12} color="var(--green)" /> Скопировано</> : <><Copy size={12} /> Копировать</>}
          </button>
          <pre style={{ fontFamily: 'monospace', fontSize: '.82rem', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
{`TELEGRAM_BOT_TOKEN=ваш_токен_здесь
TELEGRAM_CHAT_ID=ваш_chat_id`}
          </pre>
        </div>
      </div>

      {/* Password */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>🔐 Смена пароля</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '.875rem', marginBottom: 16 }}>
          Откройте <strong>.env.local</strong>, измените значения и запустите <strong>node seed.js</strong>
        </p>
        <div style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '16px 20px', position: 'relative' }}>
          <button onClick={() => copy('ADMIN_EMAIL=admin@uyutnit.uz\nADMIN_PASSWORD=новый_пароль', 'pw')}
            style={{ position: 'absolute', top: 12, right: 12, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-sub)' }}>
            {copied === 'pw' ? <><CheckCircle size={12} color="var(--green)" /> Скопировано</> : <><Copy size={12} /> Копировать</>}
          </button>
          <pre style={{ fontFamily: 'monospace', fontSize: '.82rem', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
{`ADMIN_EMAIL=admin@uyutnit.uz
ADMIN_PASSWORD=новый_пароль`}
          </pre>
        </div>
      </div>

      {/* Deploy */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
        <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>🌐 Публикация сайта</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '.875rem', marginBottom: 16 }}>
          Чтобы сайт был доступен в интернете — опубликуйте на Vercel (бесплатно):
        </p>
        {[
          '1. Создайте аккаунт на vercel.com',
          '2. Загрузите папку проекта на GitHub',
          '3. В Vercel нажмите Import → выберите репозиторий',
          '4. Добавьте переменные из .env.local в Settings → Environment Variables',
          '5. Нажмите Deploy — сайт готов!',
        ].map(s => (
          <p key={s} style={{ fontSize: '.875rem', color: 'var(--text-sub)', lineHeight: 1.8 }}>{s}</p>
        ))}
      </div>
    </div>
  )
}
