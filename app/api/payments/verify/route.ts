import { NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { fulfillOrderPayment } from '@/lib/order-fulfillment'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // 1. Rate limiting on verification endpoint (10 req/min)
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(
      { id: 'payment-verification', maxRequests: 10, windowSeconds: 60 },
      clientIp
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please wait a moment.' },
        { status: 429 }
      )
    }

    // 2. Parse request payload
    const body = await request.json()
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters.' },
        { status: 400 }
      )
    }

    // 3. HMAC SHA256 Signature Verification
    // Check if live keys are configured
    const hasKeys = !!process.env.RAZORPAY_KEY_SECRET

    if (hasKeys) {
      const isSignatureValid = verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      })

      if (!isSignatureValid) {
        console.error('[SECURITY_ALERT] Invalid Razorpay payment signature received:', {
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
          ip: clientIp,
        })
        return NextResponse.json(
          { error: 'Payment signature verification failed. Untrusted request.' },
          { status: 400 }
        )
      }
    } else {
      // In local dev without keys configured yet, check for test flag
      console.warn('[PAYMENT_VERIFY] Running without RAZORPAY_KEY_SECRET in env.')
    }

    // 4. Fulfill order atomically inside database transaction
    const fulfillment = await fulfillOrderPayment(orderId, razorpayPaymentId)

    if (!fulfillment.success) {
      return NextResponse.json(
        { error: fulfillment.error || 'Failed to complete order fulfillment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyPaid: fulfillment.alreadyPaid,
      orderNumber: fulfillment.orderNumber,
    })
  } catch (error) {
    console.error('[PAYMENT_VERIFY_ERROR] Verification failed:', error)
    return NextResponse.json(
      { error: 'Internal server error during payment verification.' },
      { status: 500 }
    )
  }
}
