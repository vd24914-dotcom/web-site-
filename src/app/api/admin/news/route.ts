import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendChannel, sendChannelPhoto } from '@/lib/telegram'
import { revalidatePath } from 'next/cache'

const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function auth() {
  return !!(await getSession())
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ news })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  if (!data.title || !data.content) {
    return NextResponse.json({ error: 'Заполните заголовок и текст' }, { status: 400 })
  }

  const item = await prisma.news.create({
    data: {
      title: data.title,
      content: data.content,
      image: data.image || null,
      published: data.published ?? true,
    },
  })

  // Публикация в Telegram-канал (если попросили)
  let channel: any = null
  if (data.postToChannel) {
    const caption = `📢 <b>${esc(data.title)}</b>\n\n${esc(data.content)}`
    if (data.image && String(data.image).startsWith('http')) {
      channel = await sendChannelPhoto(data.image, caption)
    } else {
      channel = await sendChannel(caption)
    }
  }

  revalidatePath('/news')
  revalidatePath('/')
  return NextResponse.json({ item, channel: data.postToChannel ? 'sent' : 'skipped' })
}

export async function PUT(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const item = await prisma.news.update({
    where: { id: data.id },
    data: {
      title: data.title,
      content: data.content,
      image: data.image || null,
      published: data.published ?? true,
    },
  })
  revalidatePath('/news')
  revalidatePath('/')
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = parseInt(new URL(req.url).searchParams.get('id') || '0')
  await prisma.news.delete({ where: { id } }).catch(() => {})
  revalidatePath('/news')
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
