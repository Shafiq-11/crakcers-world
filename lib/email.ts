import 'server-only'
import nodemailer from 'nodemailer'
import { formatPrice } from '@/lib/utils'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  })
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email. Returns true on success, false on failure.
 * Never throws — logs errors server-side so callers can continue.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      console.warn(
        '[EMAIL_NOTICE] SMTP credentials not fully configured in environment. Skipped sending email to:',
        options.to
      )
      return false
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Diwali Kadai" <orders@diwalikadai.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    console.log(`[EMAIL_SENT] Successfully sent email to ${options.to}: "${options.subject}"`)
    return true
  } catch (error) {
    // Log error server-side only — never expose SMTP details to client
    console.error('[EMAIL_ERROR] Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

interface OrderEmailData {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  totalAmount: number // paise
  razorpayPaymentId?: string | null
  items: Array<{
    quantity: number
    priceAtPurchase: number
    product: {
      name: string
      category?: string
    }
  }>
}

/**
 * Sends order confirmation email to the customer with itemized summary.
 */
export async function sendCustomerOrderConfirmationEmail(order: OrderEmailData): Promise<boolean> {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <strong>${item.product.name}</strong><br/>
          <span style="font-size: 12px; color: #888;">Qty: ${item.quantity} × ${formatPrice(item.priceAtPurchase)}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold;">
          ${formatPrice(item.quantity * item.priceAtPurchase)}
        </td>
      </tr>
    `
    )
    .join('')

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9fb; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #7e22ce, #9333ea); color: #ffffff; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .badge { display: inline-block; padding: 6px 14px; background: #f3e8ff; color: #7e22ce; font-weight: bold; border-radius: 20px; font-size: 12px; margin-bottom: 15px; }
          .order-box { background: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; color: #9333ea; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 26px;">🪔 Diwali Kadai</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Thank you for your order!</p>
          </div>
          <div class="content">
            <div class="badge">Payment Verified & Order Confirmed</div>
            <p>Dear <strong>${order.customerName}</strong>,</p>
            <p>We are delighted to confirm that your festive fireworks order has been received and successfully paid for.</p>
            
            <div class="order-box">
              <table style="width: 100%;">
                <tr>
                  <td><strong>Order Number:</strong></td>
                  <td style="text-align: right; font-weight: bold; color: #9333ea;">${order.orderNumber}</td>
                </tr>
                <tr>
                  <td><strong>Payment Reference:</strong></td>
                  <td style="text-align: right;">${order.razorpayPaymentId || 'Verified'}</td>
                </tr>
                <tr>
                  <td><strong>Estimated Delivery:</strong></td>
                  <td style="text-align: right;">2-4 business days (Direct from Sivakasi)</td>
                </tr>
              </table>
            </div>

            <h3 style="margin-top: 25px; margin-bottom: 10px;">Order Summary</h3>
            <table class="table">
              ${itemsHtml}
              <tr>
                <td style="padding: 15px 0; font-size: 16px; font-weight: bold;">Grand Total Paid:</td>
                <td style="padding: 15px 0; text-align: right;" class="total">${formatPrice(order.totalAmount)}</td>
              </tr>
            </table>

            <h3 style="margin-top: 25px; margin-bottom: 5px;">Delivery Destination</h3>
            <p style="background: #f9fafb; padding: 12px; border-radius: 6px; font-size: 13px; line-height: 1.5; color: #4b5563;">
              ${order.customerName}<br/>
              Phone: ${order.customerPhone}<br/>
              ${order.deliveryAddress}
            </p>

            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              Please store your fireworks in a cool, dry place away from children. Always maintain safe distance and follow safety instructions provided on packaging.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Diwali Kadai Fireworks. Have a sparkling & safe Diwali!
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: order.customerEmail,
    subject: `🪔 Order Confirmed [${order.orderNumber}] - Diwali Kadai`,
    html: emailHtml,
  })
}

/**
 * Sends order notification email to the store owner / admin.
 */
export async function sendAdminOrderNotificationEmail(order: OrderEmailData): Promise<boolean> {
  const adminEmail = process.env.STORE_ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('[EMAIL] STORE_ADMIN_EMAIL is not defined. Admin notification skipped.')
    return false
  }

  const itemsList = order.items
    .map(
      (item) =>
        `<li><strong>${item.product.name}</strong> × ${item.quantity} — ${formatPrice(
          item.priceAtPurchase * item.quantity
        )}</li>`
    )
    .join('')

  const adminHtml = `
    <h2>🚨 New Paid Order: ${order.orderNumber}</h2>
    <p>A new customer has placed and paid for an order on Diwali Kadai.</p>
    
    <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail}, ${order.customerPhone})</p>
    <p><strong>Total Paid:</strong> ${formatPrice(order.totalAmount)}</p>
    <p><strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId}</p>
    
    <h3>Items to pack:</h3>
    <ul>
      ${itemsList}
    </ul>

    <h3>Shipping Address:</h3>
    <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${order.deliveryAddress}</pre>
    
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}">View order in Admin Panel &rarr;</a></p>
  `

  return sendEmail({
    to: adminEmail,
    subject: `[NEW ORDER] ${order.orderNumber} - ${formatPrice(order.totalAmount)} from ${order.customerName}`,
    html: adminHtml,
  })
}
