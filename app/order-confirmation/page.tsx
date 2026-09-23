'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { formatPrice } from '@/lib/utils'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const orderNumber = searchParams.get('orderNumber')

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Success Hero */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
          ✓
        </div>
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-3">
          Payment Captured & Verified
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Thank you for celebrating with us!
        </h1>
        <p className="text-base text-gray-600 mt-2">
          Your order has been recorded and an email confirmation was dispatched.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-purple-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-purple-200 block">
              Order Reference
            </span>
            <span className="text-2xl font-black tracking-wide">
              {order?.orderNumber || orderNumber || 'DK-CONFIRMED'}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-200 block">
              Estimated Delivery
            </span>
            <span className="text-sm font-semibold">
              2-4 Days (Sivakasi Dispatch)
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <span className="text-xs text-gray-500 font-medium block">Order Status</span>
              <span className="text-sm font-bold text-gray-900 capitalize">
                {order?.paymentStatus === 'PAID' ? 'Paid & Preparing for Dispatch' : 'Processing Order'}
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
              Confirmed
            </span>
          </div>

          {/* Items if loaded */}
          {order?.items && order.items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
                Items In This Package
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {order.items.map((item: any) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">{item.product.name}</span>
                      <span className="text-xs text-gray-500 block">Quantity: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-sm">
            <div>
              <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Customer</h4>
              <p className="font-semibold text-gray-900">{order?.customerName || 'Valued Customer'}</p>
              <p className="text-gray-600">{order?.customerEmail}</p>
              <p className="text-gray-600">{order?.customerPhone}</p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Shipping Address</h4>
              <p className="text-gray-700 whitespace-pre-line text-xs leading-relaxed">
                {order?.deliveryAddress || 'Standard Delivery Address'}
              </p>
            </div>
          </div>

          {order?.totalAmount && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Total Paid</span>
              <span className="text-2xl font-black text-primary-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Safety notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-xs text-amber-900 space-y-1.5">
        <h4 className="font-bold flex items-center gap-1.5">
          <span>⚠️</span> Important Safety Guidelines for Fireworks
        </h4>
        <p>• Always light crackers in open outdoor spaces away from buildings, vehicles, and pets.</p>
        <p>• Children must always be supervised by adults with water buckets kept nearby.</p>
        <p>• Never attempt to relight unexploded or dud fireworks.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-200 hover:border-gray-300 bg-white font-bold text-sm text-gray-700 rounded-xl transition-all"
        >
          🖨️ Print Receipt
        </button>
        <Link
          href="/"
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl glow-purple text-center transition-all"
        >
          Return to Store →
        </Link>
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
