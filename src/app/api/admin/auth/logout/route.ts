import { NextRequest, NextResponse } from 'next/server'
import { COOKIE } from '@/lib/auth'
export async function POST(req: NextRequest) {
  // 303 — браузер откроет страницу входа обычным GET на том же домене
  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303)
  res.cookies.delete(COOKIE)
  return res
}
