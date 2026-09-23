import { NextResponse } from 'next/server'
import { verifyAdminCredentials, createAdminSession } from '@/lib/auth'
import { adminLoginSchema } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // 1. Strict rate limiting on admin login: 5 attempts per 15 minutes per IP
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(
      { id: 'admin-login', maxRequests: 5, windowSeconds: 15 * 60 },
      clientIp
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many login attempts. For security reasons, please try again in ${Math.ceil(
            rateLimit.resetIn / 60
          )} minutes.`,
        },
        { status: 429 }
      )
    }

    // 2. Validate input format
    const body = await request.json()
    const validation = adminLoginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid username or password format.' },
        { status: 400 }
      )
    }

    const { username, password } = validation.data

    // 3. Verify credentials against bcrypt hash in environment
    const isValid = await verifyAdminCredentials(username, password)

    if (!isValid) {
      console.warn(`[SECURITY] Failed admin login attempt for user "${username}" from IP ${clientIp}`)
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      )
    }

    // 4. Create signed JWT session cookie
    await createAdminSession()

    console.log(`[AUTH] Admin successfully logged in from IP ${clientIp}`)
    return NextResponse.json({ success: true, message: 'Logged in successfully' })
  } catch (error) {
    console.error('[ADMIN_LOGIN_ERROR]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    )
  }
}
