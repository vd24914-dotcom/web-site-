import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret')
    if (secret !== process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/prisma')
    const bcrypt = await import('bcryptjs')

    const email = process.env.ADMIN_EMAIL || 'admin@uyutnit.uz'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const hash = await bcrypt.hash(password, 12)

    await prisma.admin.upsert({
      where: { email },
      update: { passwordHash: hash },
      create: { email, passwordHash: hash },
    })

    return NextResponse.json({ success: true, email, password })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}