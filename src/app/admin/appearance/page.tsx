'use client'
import { useState, useEffect } from 'react'
import { Save, RefreshCw, Eye, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'
import { parseReelId, parseReels, reelUrl, reelEmbedUrl } from '@/lib/reels'

const TEXT_SECTIONS = [
  {
    label: '🏠 Общее',
    fields: [
      { key: 'site_name', label: 'Название сайта', placeholder: 'Fimush.kin' },
      { key: 'footer_text', label: 'Текст в футере', placeholder: 'Вязаные изделия с любовью...' },
    ]
  },
  {
    label: '🦸 Главный баннер',
    fields: [
      { key: 'hero_badge', label: 'Значок над заголовком', placeholder: 'Ручная работа с душой' },
      { key: 'hero_title', label: '✨ Главный заголовок (2-я строка — анимированная)', placeholder: 'Тепло, которое чувствуется\nв каждой петельке', textarea: true, note: 'Пишите заголовок в ДВЕ строки — нажмите Enter для переноса. Первая строка обычная, а вторая (после переноса) будет печататься с анимацией, розовым курсивом — как «в каждой петельке».' },
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
    label: '🏷 Акция и таймер',
    fields: [
      { key: 'sale_title', label: 'Текст акции (в баннере)', placeholder: 'Скидки недели! Успейте' },
      { key: 'sale_end', label: '🏁 Акция активна до', type: 'datetime-local', note: 'Выбери дату и время окончания акции. На сайте появится баннер с обратным отсчётом; когда время выйдет — баннер сам исчезнет. Оставь пустым, чтобы отключить.' },
    ]
  },
  {
    label: '📞 Контакты и соцсети',
    fields: [
      { key: 'contact_phone', label: '📱 Телефон', placeholder: '+998 90 000-00-00' },
      { key: 'contact_telegram', label: '✈️ Telegram (@имя или ссылка)', placeholder: '@fimushkin' },
      { key: 'social_instagram', label: '📸 Instagram (@имя или ссылка)', placeholder: '@fimushkin' },
      { key: 'social_whatsapp', label: '💬 WhatsApp (номер с кодом страны)', placeholder: '998901234567' },
      { key: 'social_facebook', label: '👍 Facebook (ссылка)', placeholder: 'https://facebook.com/...' },
      { key: 'social_youtube', label: '▶️ YouTube (ссылка)', placeholder: 'https://youtube.com/@...' },
      { key: 'contact_email', label: '✉️ Email', placeholder: 'mail@example.com' },
      { key: 'contact_address', label: '📍 Адрес', placeholder: 'Ташкент, Узбекистан' },
    ]
  },
]

export default function AppearancePage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'images' | 'text' | 'reels'>('images')
  const [activeSection, setActiveSection] = useState(0)
  const [reelInput, setReelInput] = useState('')
  const [reelError, setReelError] = useState('')

  const reels = parseReels(values.reels)
  const setReels = (list: string[]) => setValues({ ...values, reels: list.length ? JSON.stringify(list) : '' })
  const addReel = () => {
    const id = parseReelId(reelInput)
    if (!id) { setReelError('Не похоже на ссылку на рилс. Пример: https://www.instagram.com/reel/C1a2B3c4D5e/'); return }
    if (reels.includes(id)) { setReelError('Этот рилс уже добавлен'); return }
    setReels([...reels, id]); setReelInput(''); setReelError('')
  }
  const moveReel = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= reels.length) return
    const next = [...reels]; [next[i], next[j]] = [next[j], next[i]]
    setReels(next)
  }

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
        {[['images', '🖼️ Картинки и логотип'], ['text', '✏️ Тексты и контент'], ['reels', '🎬 Рилсы']].map(([key, label]) => (
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

      {/* REELS TAB */}
      {tab === 'reels' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Рилсы на главной</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16, lineHeight: 1.5 }}>
              Откройте рилс в Instagram, нажмите «Поделиться» → «Копировать ссылку» и вставьте её сюда. Блок появится на главной между «Популярными изделиями» и «О мастере». Если список пуст, блок скрыт. Рилс должен быть публичным.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input className="input" placeholder="https://www.instagram.com/reel/..." value={reelInput}
                onChange={e => { setReelInput(e.target.value); setReelError('') }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addReel() } }} />
              <button type="button" onClick={addReel} className="btn-primary" style={{ fontSize: '.85rem', whiteSpace: 'nowrap' }}><Plus size={15} /> Добавить</button>
            </div>
            {reelError && <p style={{ color: '#e53e3e', fontSize: '.78rem', marginBottom: 10 }}>{reelError}</p>}

            {reels.length === 0 ? (
              <div style={{ marginTop: 16, padding: 24, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-sub)', fontSize: '.85rem' }}>
                Пока нет ни одного рилса
              </div>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reels.map((id, i) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--pink-mist)' }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--pink)', color: 'white', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <a href={reelUrl(id)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 0, color: 'var(--text)', fontSize: '.85rem', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={13} style={{ flexShrink: 0, color: 'var(--text-sub)' }} /> instagram.com/reel/{id}
                    </a>
                    <button type="button" onClick={() => moveReel(i, -1)} disabled={i === 0} title="Выше" style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: 'var(--text-sub)', opacity: i === 0 ? .3 : 1, padding: 4, display: 'flex' }}><ArrowUp size={16} /></button>
                    <button type="button" onClick={() => moveReel(i, 1)} disabled={i === reels.length - 1} title="Ниже" style={{ background: 'none', border: 'none', cursor: i === reels.length - 1 ? 'default' : 'pointer', color: 'var(--text-sub)', opacity: i === reels.length - 1 ? .3 : 1, padding: 4, display: 'flex' }}><ArrowDown size={16} /></button>
                    <button type="button" onClick={() => setReels(reels.filter((_, j) => j !== i))} title="Удалить" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', padding: 4, display: 'flex' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>Заголовок блока</label>
                <input className="input" placeholder="Рилсы из мастерской" value={values.reels_title || ''} onChange={e => setValues({ ...values, reels_title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>Подзаголовок</label>
                <input className="input" placeholder="Процесс, новинки и немного уюта — подписывайтесь в Instagram" value={values.reels_subtitle || ''} onChange={e => setValues({ ...values, reels_subtitle: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>Кнопка (ведёт на ваш Instagram из раздела «Контакты»)</label>
                <input className="input" placeholder="Смотреть в Instagram" value={values.reels_btn || ''} onChange={e => setValues({ ...values, reels_btn: e.target.value })} />
              </div>
              <div><SaveBtn /></div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontSize: '.95rem' }}>Предпросмотр</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.78rem', marginBottom: 14 }}>Первый рилс из списка</p>
            {reels[0] ? (
              <div style={{ width: 280, height: 560, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', margin: '0 auto' }}>
                <iframe src={reelEmbedUrl(reels[0])} title="Предпросмотр рилса" style={{ width: '100%', height: '100%', border: 0 }} allow="encrypted-media" allowFullScreen />
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '.85rem', border: '1px dashed var(--border)', borderRadius: 12 }}>Добавьте рилс</div>
            )}
          </div>
        </div>
      )}

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
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.875rem', fontWeight: 500, color: 'var(--text)' }}>
                <input type="checkbox" checked={values.logo_show_text !== '0'} onChange={e => setValues({ ...values, logo_show_text: e.target.checked ? '1' : '0' })} style={{ width: 16, height: 16 }} />
                Показывать название рядом с логотипом
              </label>
              <p style={{ color: 'var(--text-sub)', fontSize: '.75rem', marginTop: 4 }}>Отключите, если у вас логотип-картинка (PNG) и текст не нужен.</p>
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

          {/* Иконки преимуществ */}
          <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Иконки блока «Преимущества»</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '.8rem', marginBottom: 16 }}>4 иконки на главной. Если не загружать — останутся эмодзи (💝 ✏️ ⭐ 🚚). Лучше квадратный PNG с прозрачным фоном.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              {[1, 2, 3, 4].map(n => (
                <ImageUploader key={n} value={values['benefit' + n + '_icon']} onChange={url => setValues({ ...values, ['benefit' + n + '_icon']: url })} label={'Иконка ' + n} />
              ))}
            </div>
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
                <div key={field.key} style={(field as any).note ? { background: 'var(--pink-mist)', border: '1px solid var(--pink-light)', borderRadius: 12, padding: 14 } : undefined}>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontSize: '.875rem' }}>{field.label}</label>
                  {field.textarea ? (
                    <textarea className="input" rows={3} placeholder={field.placeholder}
                      value={values[field.key] || ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} />
                  ) : (
                    <input className="input" type={(field as any).type || 'text'} placeholder={field.placeholder}
                      value={values[field.key] || ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} />
                  )}
                  {(field as any).note && (
                    <p style={{ color: 'var(--pink-dark)', fontSize: '.78rem', marginTop: 8, lineHeight: 1.5 }}>💡 {(field as any).note}</p>
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
