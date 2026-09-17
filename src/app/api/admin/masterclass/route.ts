import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parseYouTubeId, youtubeThumb, normalizeDuration } from '@/lib/video'

async function auth() {
  return !!(await getSession())
}

function revalidate() {
  revalidatePath('/')
  revalidatePath('/masterclass')
}

/** Проверяет и приводит данные мастер-класса из формы к виду для базы */
function normalize(data: any): { value?: any; error?: string } {
  const title = String(data.title || '').trim()
  if (!title) return { error: 'Введите название' }
  const kind = data.kind === 'file' ? 'file' : 'youtube'
  let videoUrl = String(data.videoUrl || '').trim()
  let cover = String(data.cover || '').trim() || null

  if (kind === 'youtube') {
    const id = parseYouTubeId(videoUrl)
    if (!id) return { error: 'Не похоже на ссылку YouTube' }
    videoUrl = id
    if (!cover) cover = youtubeThumb(id)
  } else if (!videoUrl.startsWith('http')) {
    return { error: 'Загрузите видеофайл' }
  }

  return {
    value: {
      title,
      description: String(data.description || '').trim(),
      kind,
      videoUrl,
      cover,
      duration: normalizeDuration(String(data.duration || '')) || null,
      published: data.published ?? true,
      sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
    },
  }
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await prisma.masterClass.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const n = normalize(await req.json())
  if (n.error || !n.value) return NextResponse.json({ error: n.error || 'Ошибка' }, { status: 400 })
  const item = await prisma.masterClass.create({ data: n.value })
  revalidate()
  return NextResponse.json({ item })
}

export async function PUT(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const n = normalize(data)
  if (n.error || !n.value) return NextResponse.json({ error: n.error || 'Ошибка' }, { status: 400 })
  const item = await prisma.masterClass.update({ where: { id: Number(data.id) }, data: n.value })
  revalidate()
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = parseInt(new URL(req.url).searchParams.get('id') || '0')
  await prisma.masterClass.delete({ where: { id } }).catch(() => {})
  revalidate()
  return NextResponse.json({ success: true })
}
