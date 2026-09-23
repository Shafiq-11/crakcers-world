'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { formatPrice } from '@/lib/utils'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
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
    if (id) loadOrder()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNav />
        <main className="flex-1 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-xs font-bold text-primary-600 underline"
          >
            ← Back to orders list
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              ← Back to Orders
            </Link>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              🖨️ Print Packing Slip
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Header bar */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Order Invoice
                </span>
                <h1 className="text-2xl font-black text-gray-900">{order.orderNumber}</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                <div>
                  <span className="font-bold text-gray-500 block">Razorpay Order ID</span>
                  <span className="font-mono text-gray-900">{order.razorpayOrderId || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Razorpay Payment ID</span>
                  <span className="font-mono text-primary-700 font-bold">
                    {order.razorpayPaymentId || 'Awaiting Payment'}
                  </span>
                </div>
              </div>

              {/* Customer and Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Customer Details
                  </h3>
                  <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                  <p className="text-gray-600 mt-1">Phone: {order.customerPhone}</p>
                  <p className="text-gray-600">Email: {order.customerEmail}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Shipping & Delivery Address
                  </h3>
                  <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                  Items to Dispatch ({order.items?.length || 0})
                </h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4 text-center">Quantity</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900">{item.product.name}</span>
                            <span className="text-[10px] text-gray-400 block">
                              Category: {item.product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {formatPrice(item.priceAtPurchase)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatPrice(item.priceAtPurchase * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/70 border-t border-gray-100">
                        <td colSpan={3} className="py-3 px-4 font-bold text-gray-700 text-right">
                          Total Amount Paid:
                        </td>
                        <td className="py-3 px-4 font-black text-primary-600 text-right text-base">
                          {formatPrice(order.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
