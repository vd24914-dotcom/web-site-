import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 401 })
  const valid = await bcrypt.compare(password, (admin as any).passwordHash)
  if (!valid) return NextResponse.json({ error: 'Invalid' }, { status: 401 })
  const token = await signToken({ id: (admin as any).id, email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
  return res
}
