import 'server-only'
import Razorpay from 'razorpay'
import crypto from 'crypto'

// Validate Razorpay key configuration
export function validateRazorpayKeys(): void {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error(
      'FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.'
    )
  }

  if (process.env.NODE_ENV === 'production') {
    if (keyId.startsWith('rzp_test_')) {
      throw new Error(
        'FATAL: Razorpay TEST key detected in production environment! Use live keys (rzp_live_*).'
      )
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (keyId.startsWith('rzp_live_')) {
      console.warn(
        'WARNING: Using Razorpay LIVE key in non-production environment! Consider using test keys.'
      )
    }
  }
}

let razorpayInstance: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    validateRazorpayKeys()
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return razorpayInstance
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const instance = getRazorpay()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * Used after checkout callback to confirm payment authenticity.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured')
  }
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

/**
 * Verify Razorpay webhook signature using HMAC SHA256.
 * Uses the separate webhook secret.
 */
export function verifyWebhookSignature({
  body,
  signature,
}: {
  body: string
  signature: string
}): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured')
  }
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}
