import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const rows = await prisma.siteSettings.findMany().catch(() => [])
  const settings = Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]))
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { settings } = await req.json()
  
  for (const [key, value] of Object.entries(settings)) {
    if (value === '' || value === null || value === undefined) {
      await prisma.siteSettings.delete({ where: { key } }).catch(() => {})
    } else {
      await prisma.siteSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    }
  }

  // Revalidate all public pages so changes appear immediately
  revalidatePath('/')
  revalidatePath('/catalog')
  revalidatePath('/product/[slug]', 'page')

  return NextResponse.json({ success: true })
}
