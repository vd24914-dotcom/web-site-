import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-32chars-minimum!!')
const COOKIE = 'uyutnit_admin'

export async function signToken(payload: any) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(SECRET)
}

export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, SECRET); return payload } catch { return null }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export { COOKIE }
