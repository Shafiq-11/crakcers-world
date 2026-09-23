'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { formatPrice } from '@/lib/utils'
import { jsPDF } from 'jspdf'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const orderNumber = searchParams.get('orderNumber')

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId && !orderNumber) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/orders/${orderId || orderNumber}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        }
      } catch (err) {
        console.error('Failed to load order:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId, orderNumber])

  // PDF Generator for Mobile & Desktop Download
  const handleDownloadPdf = () => {
    setDownloadingPdf(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const uniqueId = order?.orderNumber || orderNumber || 'DK-RECEIPT'
      const customerName = order?.customerName || 'Valued Customer'
      const customerPhone = order?.customerPhone || 'N/A'
      const customerEmail = order?.customerEmail || 'N/A'
      const totalFormatted = formatPrice(order?.totalAmount || 0)
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      // 1. Header Banner
      doc.setFillColor(147, 51, 234) // Primary Purple
      doc.rect(0, 0, 210, 36, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('DIWALI KADAI FIREWORKS', 14, 18)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('IN-STORE PICKUP PASS & PAYMENT RECEIPT', 14, 26)
      doc.text(`Generated: ${dateStr}`, 145, 26)

      // 2. Order Reference Callout Box
      doc.setDrawColor(147, 51, 234)
      doc.setFillColor(250, 245, 255)
      doc.roundedRect(14, 44, 182, 38, 3, 3, 'FD')

      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('UNIQUE ORDER PICKUP ID (SHOW AT STORE COUNTER)', 20, 52)

      doc.setTextColor(147, 51, 234)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(uniqueId, 20, 62)

      doc.setTextColor(40, 167, 69)
      doc.setFontSize(10)
      doc.text('STATUS: VERIFIED & PAID (READY FOR COLLECTION)', 20, 72)

      doc.setTextColor(70, 70, 70)
      doc.setFontSize(9)
      doc.text(`Payment ID: ${order?.razorpayPaymentId || 'Verified'}`, 120, 72)

      // 3. Customer Info Section
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('CUSTOMER INFORMATION', 14, 92)

      doc.setDrawColor(230, 230, 230)
      doc.line(14, 95, 196, 95)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Customer Name: ${customerName}`, 14, 103)
      doc.text(`Mobile Number: +91 ${customerPhone}`, 14, 110)
      doc.text(`Email Address: ${customerEmail}`, 14, 117)
      doc.text('Pickup Outlet: Diwali Kadai Main Counter — Sivakasi Outlet', 14, 124)

      // 4. Items List
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('ORDERED FIREWORKS ITEMS', 14, 136)
      doc.line(14, 139, 196, 139)

      // Table Header
      doc.setFillColor(245, 245, 245)
      doc.rect(14, 142, 182, 8, 'F')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text('Item Description', 18, 147)
      doc.text('Qty', 130, 147)
      doc.text('Unit Price', 150, 147)
      doc.text('Subtotal', 178, 147)

      let currentY = 156
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)

      if (order?.items && order.items.length > 0) {
        order.items.forEach((item: any) => {
          const itemName = item.product?.name || 'Cracker Item'
          const itemQty = item.quantity || 1
          const unitPrice = formatPrice(item.priceAtPurchase || 0)
          const lineTotal = formatPrice((item.priceAtPurchase || 0) * itemQty)

          doc.text(itemName.substring(0, 48), 18, currentY)
          doc.text(String(itemQty), 132, currentY)
          doc.text(unitPrice, 150, currentY)
          doc.text(lineTotal, 178, currentY)
          currentY += 7
        })
      } else {
        doc.text('Standard Fireworks Package', 18, currentY)
        doc.text('1', 132, currentY)
        doc.text(totalFormatted, 150, currentY)
        doc.text(totalFormatted, 178, currentY)
        currentY += 7
      }

      // Total Line
      doc.setDrawColor(200, 200, 200)
      doc.line(14, currentY + 2, 196, currentY + 2)
      currentY += 10

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(30, 30, 30)
      doc.text('Total Amount Paid (Store Pickup):', 110, currentY)
      doc.setTextColor(147, 51, 234)
      doc.setFontSize(14)
      doc.text(totalFormatted, 175, currentY)

      // 5. Store Counter Collection Instructions
      currentY += 16
      doc.setFillColor(254, 243, 199) // Amber
      doc.setDrawColor(245, 158, 11)
      doc.roundedRect(14, currentY, 182, 26, 2, 2, 'FD')

      doc.setTextColor(146, 64, 14)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('IMPORTANT STORE PICKUP NOTICE:', 18, currentY + 7)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text('• Show this PDF receipt on your mobile screen or quote your Order ID at the counter.', 18, currentY + 13)
      doc.text('• Your fireworks are packed in moisture-proof boxes ready for immediate handover.', 18, currentY + 18)
      doc.text('• For assistance, call our store desk with your Order ID.', 18, currentY + 23)

      // 6. Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Diwali Kadai • Certified Green Fireworks • Safe & Sparkling Diwali', 50, 285)

      // Download file to mobile/desktop
      doc.save(`Diwali-Kadai-Receipt-${uniqueId}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      // Fallback to window print
      window.print()
    } finally {
      setDownloadingPdf(false)
    }
  }

  const uniqueId = order?.orderNumber || orderNumber || 'DK-CONFIRMED'
  const customerName = order?.customerName || 'Valued Customer'
  const customerPhone = order?.customerPhone || 'Registered Mobile'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-3 shadow-sm animate-bounce">
          ✓
        </div>
        <span className="inline-block px-3 py-1 bg-purple-100 text-primary-700 text-xs font-bold rounded-full mb-2">
          Payment Successful & Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Ready for In-Store Pickup!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
          Your payment was received. Please present your Order ID at our store counter to collect your fireworks.
        </p>
      </div>

      {/* Prominent Order Pickup Pass Box */}
      <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-md overflow-hidden mb-6">
        {/* Purple Header Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 p-5 sm:p-6 text-white text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-purple-200 block">
              Unique Order ID (Show at Counter)
            </span>
            <span className="text-2xl sm:text-3xl font-black tracking-wider font-mono">
              {uniqueId}
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30 inline-block">
              🏬 Pay & Get in Store
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Customer Highlight Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
            <div>
              <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">
                Customer Name
              </span>
              <span className="text-sm font-extrabold text-gray-900">{customerName}</span>
            </div>
            <div>
              <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">
                Mobile Number
              </span>
              <span className="text-sm font-extrabold text-gray-900">+91 {customerPhone}</span>
            </div>
          </div>

          {/* Store Location Notice */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <span>📍</span>
              <span>Pickup Counter Location</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Diwali Kadai Fireworks Counter — Main Sivakasi Outlet.<br />
              Open daily: 9:00 AM – 9:00 PM throughout the festive season.
            </p>
          </div>

          {/* Items In Box */}
          {order?.items && order.items.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2.5">
                Items Packed for You ({order.items.length})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                {order.items.map((item: any) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">{item.product.name}</span>
                      <span className="text-[11px] text-gray-400 block">Quantity: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Paid */}
          {order?.totalAmount && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Total Paid (Online)</span>
              <span className="text-2xl font-black text-primary-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action: Download Receipt as PDF */}
      <div className="space-y-3 mb-8">
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl glow-purple shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          {downloadingPdf ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <span>📥</span>
              <span>Download PDF Receipt (Order ID & Details)</span>
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all"
          >
            🖨️ Print Receipt
          </button>

          <Link
            href="/"
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl text-center transition-all flex items-center justify-center"
          >
            ← Back to Store
          </Link>
        </div>
      </div>

      {/* Safety Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
        <h4 className="font-bold flex items-center gap-1.5">
          <span>⚠️</span> Safe Transport & Handling Guidelines
        </h4>
        <p>• Keep fireworks in the trunk/boot of your vehicle away from direct sunlight or heat sources.</p>
        <p>• Store in a dry, ventilated room out of reach of children until lighting.</p>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <OrderConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
