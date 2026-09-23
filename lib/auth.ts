import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 8 * 60 * 60 // 8 hours in seconds

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET must be set and at least 32 characters long'
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Verify admin credentials against environment variables.
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (!expectedUsername || !passwordHash) {
    console.error('[AUTH] Admin credentials not configured in environment')
    return false
  }

  // Constant-time username comparison isn't critical here since
  // we also check the password, but we check both anyway
  if (username !== expectedUsername) {
    // Still run bcrypt.compare to prevent timing attacks on username
    await bcrypt.compare(password, passwordHash)
    return false
  }

  return bcrypt.compare(password, passwordHash)
}

/**
 * Create a signed JWT session token and set it as an httpOnly cookie.
 */
export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSessionSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

/**
 * Verify the admin session cookie. Returns true if valid.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) return false

    const { payload } = await jwtVerify(token, getSessionSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Destroy the admin session by clearing the cookie.
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
