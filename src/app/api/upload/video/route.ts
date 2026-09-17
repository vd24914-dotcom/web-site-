import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getSession } from '@/lib/auth'

// Видео загружаются из браузера напрямую в Vercel Blob (client upload):
// сервер только выдаёт разрешение, поэтому лимит тела запроса в 4.5 МБ не мешает.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!await getSession()) throw new Error('Unauthorized')
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Ссылка сохраняется в базу вместе с мастер-классом из админки
      },
    })
    return NextResponse.json(json)
  } catch (error: any) {
    const msg = error?.message || 'Ошибка загрузки видео'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 400 })
  }
}
