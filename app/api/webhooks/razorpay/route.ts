import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { fulfillOrderPayment } from '@/lib/order-fulfillment'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // 1. Rate limiting on webhook (30 req/min per IP to allow normal Razorpay retries)
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(
      { id: 'razorpay-webhook', maxRequests: 30, windowSeconds: 60 },
      clientIp
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Webhook rate limit exceeded.' },
        { status: 429 }
      )
    }

    // 2. Read raw body and signature header
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.warn('[SECURITY] Missing x-razorpay-signature header in webhook from IP:', clientIp)
      return NextResponse.json(
        { error: 'Missing webhook signature header' },
        { status: 400 }
      )
    }

    // 3. Verify HMAC signature
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature({
        body: rawBody,
        signature,
      })

      if (!isValid) {
        console.error('[SECURITY_ALERT] Invalid Razorpay webhook signature from IP:', clientIp)
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 400 }
        )
      }
    } else {
      console.warn('[WEBHOOK_NOTICE] RAZORPAY_WEBHOOK_SECRET not set in env. Verifying skipped for dev.')
    }

    // 4. Parse payload and process events
    const payload = JSON.parse(rawBody)
    const event = payload.event

    console.log(`[WEBHOOK_EVENT] Received event: ${event}`)

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity
      const razorpayOrderId = paymentEntity?.order_id
      const razorpayPaymentId = paymentEntity?.id

      if (!razorpayOrderId) {
        console.warn('[WEBHOOK] No order_id found in payment entity')
        return NextResponse.json({ received: true })
      }

      // Look up matching order
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
      })

      if (!order) {
        console.warn(`[WEBHOOK] Order with razorpayOrderId ${razorpayOrderId} not found in database.`)
        return NextResponse.json({ received: true })
      }

      // Idempotent fulfillment
      await fulfillOrderPayment(order.id, razorpayPaymentId)
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity
      const razorpayOrderId = paymentEntity?.order_id

      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: {
            razorpayOrderId,
            paymentStatus: 'PENDING',
          },
          data: {
            paymentStatus: 'FAILED',
          },
        })
        console.log(`[WEBHOOK] Order with Razorpay order ${razorpayOrderId} marked as FAILED.`)
      }
    }

    return NextResponse.json({ status: 'ok', received: true })
  } catch (error) {
    console.error('[WEBHOOK_ERROR] Unexpected error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    )
  }
}
