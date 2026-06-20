'use client'
import { useState, useEffect } from 'react'
import { Save, RefreshCw, Eye } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'

const TEXT_SECTIONS = [
  {
    label: '🏠 Общее',
    fields: [
      { key: 'site_name', label: 'Название сайта', placeholder: 'УютНить' },
      { key: 'footer_text', label: 'Текст в футере', placeholder: 'Вязаные изделия с любовью...' },
    ]
  },
  {
    label: '🦸 Главный баннер',
    fields: [
      { key: 'hero_badge', label: 'Значок над заголовком', placeholder: 'Ручная работа с душой' },
      { key: 'hero_title', label: 'Главный заголовок', placeholder: 'Тепло, которое чувствуется...', textarea: true },
      { key: 'hero_subtitle', label: 'Подзаголовок', placeholder: 'Описание...', textarea: true },
      { key: 'hero_btn', label: 'Кнопка 1', placeholder: 'Смотреть каталог' },
      { key: 'hero_btn2', label: 'Кнопка 2', placeholder: 'О мастере' },
      { key: 'hero_badge2', label: 'Карточка — заголовок', placeholder: 'Новинка!' },
      { key: 'hero_badge2_sub', label: 'Карточка — подпись', placeholder: 'Зимняя коллекция' },
    ]
  },
  {
    label: '📊 Статистика',
    fields: [
      { key: 'stats1', label: 'Число 1', placeholder: '200+' },
      { key: 'stats1_label', label: 'Подпись 1', placeholder: 'Изделий продано' },
      { key: 'stats2', label: 'Число 2', placeholder: '10+' },
      { key: 'stats2_label', label: 'Подпись 2', placeholder: 'Лет опыта' },
      { key: 'stats3', label: 'Число 3', placeholder: '100%' },
      { key: 'stats3_label', label: 'Подпись 3', placeholder: 'Ручная работа' },
    ]
  },
  {
    label: '✅ Преимущества',
    fields: [
      { key: 'benefit1_title', label: 'Блок 1 — заголовок', placeholder: 'С любовью' },
      { key: 'benefit1_desc', label: 'Блок 1 — текст', placeholder: '...', textarea: true },
      { key: 'benefit2_title', label: 'Блок 2 — заголовок', placeholder: 'Под заказ' },
      { key: 'benefit2_desc', label: 'Блок 2 — текст', placeholder: '...', textarea: true },
      { key: 'benefit3_title', label: 'Блок 3 — заголовок', placeholder: 'Качество' },
      { key: 'benefit3_desc', label: 'Блок 3 — текст', placeholder: '...', textarea: true },
      { key: 'benefit4_title', label: 'Блок 4 — заголовок', placeholder: 'Доставка' },
      { key: 'benefit4_desc', label: 'Блок 4 — текст', placeholder: '...', textarea: true },
    ]
  },
  {
    label: '👩‍🎨 О мастере',
    fields: [
      { key: 'about_title', label: 'Заголовок', placeholder: 'Создаю тепло своими руками' },
      { key: 'about_text', label: 'Текст', placeholder: 'О мастере...', textarea: true },
    ]
  },
  {
    label: '📣 Секция «Заказать»',
    fields: [
      { key: 'cta_title', label: 'Заголовок', placeholder: 'Хотите заказать?' },
      { key: 'cta_text', label: 'Текст', placeholder: 'Описание...', textarea: true },
      { key: 'cta_btn', label: 'Кнопка', placeholder: 'Оставить заявку' },
    ]
  },
  {
    label: '📞 Контакты',
    fields: [
      { key: 'contact_phone', label: 'Телефон', placeholder: '+998 90 000-00-00' },
      { key: 'contact_telegram', label: 'Telegram', placeholder: '@uyutnit' },
      { key: 'contact_address', label: 'Адрес', placeholder: 'Ташкент, Узбекистан' },
    ]
  },
]

export default function AppearancePage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'images' | 'text'>('images')
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      setValues(d.settings || {}); setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: values })
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const SaveBtn = () => (
    <button onClick={save} disabled={saving} className="btn-primary" style={{ fontSize: '.85rem' }}>
      {saving ? <><RefreshCw size={15} className="animate-spin" /> Сохраняем...</> : saved ? '✅ Сохранено!' : <><Save size={15} /> Сохранить</>}
    </button>
  )

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><RefreshCw size={32} className="animate-spin" style={{ color: 'var(--pink)', margin: '0 auto' }} /></div>

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Дизайн и контент</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '.9rem', marginTop: 4 }}>Редактируйте тексты, картинки и логотип без кода</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/" target="_blank" className="btn-outline" style={{ padding: '.65rem 1.25rem', fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Eye size={15} /> Смотреть сайт
          </a>
          <SaveBtn />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['images', '🖼️ Картинки и логотип'], ['text', '✏️ Тексты и контент']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid', cursor: 'pointer', fontSize: '.9rem', fontWeight: 600, transition: 'all .15s',
              background: tab === key ? 'var(--pink)' : 'white',
              borderColor: tab === key ? 'var(--pink)' : 'var(--border)',
              color: tab === key ? 'white' : 'var(--text-sub)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* IMAGES TAB */}
      {tab === 'images' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>

          {/* Logo image */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Логотип сайта</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16 }}>Отображается в шапке и футере</p>
            <ImageUploader
              value={values.logo_image}
              onChange={url => setValues({ ...values, logo_image: url })}
              hint="Рекомендуется квадратное изображение, PNG с прозрачным фоном"
            />
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Или эмодзи (если нет логотипа)</label>
              <input className="input" placeholder="🧶" value={values.logo_emoji || ''} onChange={e => setValues({ ...values, logo_emoji: e.target.value })} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
            </div>
          </div>

          {/* Hero image */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Картинка на главном баннере</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16 }}>Большая картинка справа на главной странице</p>
            <ImageUploader
              value={values.hero_image}
              onChange={url => setValues({ ...values, hero_image: url })}
              hint="Рекомендуется 600×600px или квадратная"
            />
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Или эмодзи иконка</label>
              <input className="input" placeholder="🧶" value={values.hero_icon || ''} onChange={e => setValues({ ...values, hero_icon: e.target.value })} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
            </div>
          </div>

          {/* About image */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Фото мастера</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16 }}>Отображается в секции «О мастере»</p>
            <ImageUploader
              value={values.about_image}
              onChange={url => setValues({ ...values, about_image: url })}
              hint="Ваша фотография или фото процесса работы"
            />
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontSize: '.875rem' }}>Или эмодзи</label>
              <input className="input" placeholder="👩‍🎨" value={values.about_icon || ''} onChange={e => setValues({ ...values, about_icon: e.target.value })} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
            </div>
          </div>

          {/* OG Image */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>OG-картинка (соцсети)</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16 }}>Показывается при отправке ссылки в WhatsApp, Telegram, Instagram</p>
            <ImageUploader
              value={values.og_image}
              onChange={url => setValues({ ...values, og_image: url })}
              hint="Рекомендуется 1200×630px, JPG"
            />
          </div>

          <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
            <SaveBtn />
          </div>
        </div>
      )}

      {/* TEXT TAB */}
      {tab === 'text' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TEXT_SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setActiveSection(i)}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: '1px solid', cursor: 'pointer', fontSize: '.85rem', fontWeight: 500, transition: 'all .15s',
                  background: activeSection === i ? 'var(--pink-light)' : 'transparent',
                  borderColor: activeSection === i ? 'var(--pink-light)' : 'transparent',
                  color: activeSection === i ? 'var(--pink-dark)' : 'var(--text-sub)',
                }}>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 24, fontSize: '1.1rem' }}>
              {TEXT_SECTIONS[activeSection].label}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {TEXT_SECTIONS[activeSection].fields.map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>{field.label}</label>
                  {field.textarea ? (
                    <textarea className="input" rows={3} placeholder={field.placeholder}
                      value={values[field.key] || ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} />
                  ) : (
                    <input className="input" placeholder={field.placeholder}
                      value={values[field.key] || ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <SaveBtn />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
