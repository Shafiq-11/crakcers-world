import 'server-only'
import { prisma } from '@/lib/prisma'
import { sendCustomerOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email'

export interface FulfillmentResult {
  success: boolean
  alreadyPaid: boolean
  orderNumber?: string
  error?: string
}

/**
 * Idempotently fulfills an order upon verified Razorpay payment.
 * Decrements stock atomically within a database transaction.
 * Sends confirmation emails to customer and store owner.
 */
export async function fulfillOrderPayment(
  orderId: string,
  razorpayPaymentId: string
): Promise<FulfillmentResult> {
  try {
    // 1. Transactional check and atomic stock decrement
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error(`Order not found: ${orderId}`)
      }

      // IDEMPOTENCY CHECK: If already marked PAID, do not decrement stock or send duplicate emails
      if (order.paymentStatus === 'PAID') {
        return { alreadyPaid: true, order }
      }

      // Atomically decrement stock for each product
      for (const item of order.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        })

        if (updateResult.count === 0) {
          throw new Error(
            `Insufficient stock for item "${item.product.name}" (ID: ${item.productId}) to fulfill order ${order.orderNumber}`
          )
        }
      }

      // Update order status to PAID
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          razorpayPaymentId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return { alreadyPaid: false, order: updatedOrder }
    })

    if (result.alreadyPaid) {
      console.log(`[FULFILLMENT] Order ${result.order.orderNumber} was already fulfilled. Skipping duplicate action.`)
      return {
        success: true,
        alreadyPaid: true,
        orderNumber: result.order.orderNumber,
      }
    }

    // 2. Send confirmation emails outside the transaction
    // If SMTP fails, the error is logged and caught so the captured payment / order is never failed!
    const orderData = result.order
    try {
      await Promise.allSettled([
        sendCustomerOrderConfirmationEmail(orderData),
        sendAdminOrderNotificationEmail(orderData),
      ])
    } catch (emailErr) {
      console.error(
        `[FULFILLMENT] Non-critical email sending failed for order ${orderData.orderNumber}:`,
        emailErr instanceof Error ? emailErr.message : emailErr
      )
    }

    console.log(`[FULFILLMENT] Order ${orderData.orderNumber} successfully fulfilled and paid.`)
    return {
      success: true,
      alreadyPaid: false,
      orderNumber: orderData.orderNumber,
    }
  } catch (error) {
    console.error(
      `[FULFILLMENT_ERROR] Failed to fulfill order ${orderId}:`,
      error instanceof Error ? error.message : error
    )
    return {
      success: false,
      alreadyPaid: false,
      error: error instanceof Error ? error.message : 'Unknown fulfillment error',
    }
  }
}
