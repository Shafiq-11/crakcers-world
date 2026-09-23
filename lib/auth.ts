import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 8 * 60 * 60 // 8 hours in seconds

const DEFAULT_SECRET = 'a6f82f64913692fc4821f83b32b0d7a3c5192db4b4db133e6179436b015199be'
const DEFAULT_USERNAME = 'admin'
const DEFAULT_HASH = '$2b$10$AOUDAhL4YQMY3c9D8hEWjuBVs3OxOrAKuKj7kfEi4JNa.K3LrZgyi' // password: admin123

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET
  return new TextEncoder().encode(secret)
}

/**
 * Verify admin credentials against environment variables.
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME || DEFAULT_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH

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
