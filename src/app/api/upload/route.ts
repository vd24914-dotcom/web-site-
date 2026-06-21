import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { put } from '@vercel/blob'

// Загружает фото в Vercel Blob (быстрое облако/CDN) и возвращает ссылку.
// В базе сайта хранится только короткая ссылка — страницы остаются лёгкими.
export async function POST(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Нет файла' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 })
    }

    const ext = (file.type.split('/')[1] || 'webp').replace('+xml', '')
    const name = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(name, file, { access: 'public', contentType: file.type })
    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Ошибка загрузки. Проверьте, что подключено хранилище Blob.' },
      { status: 500 }
    )
  }
}
