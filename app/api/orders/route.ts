import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkoutSchema, formatZodErrors } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { generateOrderNumber } from '@/lib/utils'
import { razorpay } from '@/lib/razorpay'
import { FALLBACK_PRODUCTS } from '@/lib/sample-products'

export async function POST(request: Request) {
  try {
    // 1. Rate limiting (10 requests per minute per IP to prevent spam order generation)
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(
      { id: 'checkout-creation', maxRequests: 10, windowSeconds: 60 },
      clientIp
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many checkout attempts. Please try again in ${rateLimit.resetIn} seconds.`,
        },
        { status: 429 }
      )
    }

    // 2. Validate input format using Zod
    const body = await request.json()
    const validationResult = checkoutSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      )
    }

    const { customerName, customerPhone, customerEmail, deliveryAddress, items } =
      validationResult.data

    // 3. Server-side price & stock recalculation
    // NEVER TRUST CLIENT-SUBMITTED AMOUNTS
    const productIds = items.map((i) => i.productId)

    let dbProducts: Array<{
      id: string
      name: string
      price: number
      stockQuantity: number
      isActive: boolean
    }> = []

    try {
      dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      })
    } catch (e) {
      console.warn('[ORDERS_API] DB lookup fallback:', e instanceof Error ? e.message : e)
    }

    // Fallback if DB is empty or table not populated
    if (dbProducts.length === 0) {
      dbProducts = FALLBACK_PRODUCTS.filter((p) => productIds.includes(p.id))
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    let calculatedItemsTotal = 0
    const verifiedOrderItems: Array<{
      productId: string
      quantity: number
      priceAtPurchase: number
    }> = []

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} is no longer available.` },
          { status: 400 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `"${product.name}" is currently inactive and cannot be ordered.` },
          { status: 400 }
        )
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        )
      }

      calculatedItemsTotal += product.price * item.quantity
      verifiedOrderItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      })
    }

    // In-store pickup: no shipping fee
    const shippingPaise = 0
    const grandTotalPaise = calculatedItemsTotal
    const orderNumber = generateOrderNumber()

    // 4. Create Order & OrderItems in DB with paymentStatus = PENDING
    let createdOrder: any = null

    try {
      createdOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress,
          totalAmount: grandTotalPaise,
          paymentStatus: 'PENDING',
          items: {
            create: verifiedOrderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase,
            })),
          },
        },
      })
    } catch (dbErr) {
      console.warn('[ORDER_CREATE] DB insert error, using in-memory order object:', dbErr instanceof Error ? dbErr.message : dbErr)
      createdOrder = {
        id: `ord_${Date.now()}`,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        totalAmount: grandTotalPaise,
        paymentStatus: 'PENDING',
      }
    }

    // 5. Create Razorpay order
    let razorpayOrderId = `order_sim_${Date.now()}`
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder'

    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const rzpOrder = await razorpay.orders.create({
          amount: grandTotalPaise,
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            orderId: createdOrder.id,
            orderNumber: orderNumber,
            customerPhone: customerPhone,
          },
        })
        razorpayOrderId = rzpOrder.id

        // Update order with real Razorpay Order ID
        if (createdOrder.id && !createdOrder.id.startsWith('ord_')) {
          await prisma.order.update({
            where: { id: createdOrder.id },
            data: { razorpayOrderId: rzpOrder.id },
          })
        }
      } else {
        console.warn('[RAZORPAY_NOTICE] RAZORPAY_KEY_ID / SECRET not present. Running with simulated order ID.')
      }
    } catch (rzpErr) {
      console.error('[RAZORPAY_CREATE_ERROR] Failed to create Razorpay order:', rzpErr)
      return NextResponse.json(
        { error: 'Failed to initialize payment gateway. Please verify payment configuration.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      orderNumber: orderNumber,
      razorpayOrderId: razorpayOrderId,
      amount: grandTotalPaise,
      currency: 'INR',
      keyId: keyId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    })
  } catch (error) {
    console.error('[ORDERS_POST_ERROR] Unexpected error during checkout creation:', error)
    return NextResponse.json(
      { error: 'Failed to process order checkout. Please try again.' },
      { status: 500 }
    )
  }
}
