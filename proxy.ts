import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE_NAME = 'admin_session'

const DEFAULT_SECRET = 'a6f82f64913692fc4821f83b32b0d7a3c5192db4b4db133e6179436b015199be'

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET
  return new TextEncoder().encode(secret)
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return false

    const secret = getSessionSecret()
    if (secret.length === 0) return false

    const { payload } = await jwtVerify(token, secret)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const isAuth = await isAdminAuthenticated(request)
    if (!isAuth) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect all /api/admin routes except /api/admin/login
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const isAuth = await isAdminAuthenticated(request)
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
