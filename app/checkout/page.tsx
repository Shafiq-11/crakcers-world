'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const getTotalPaise = useCartStore((s) => s.getTotalPaise)

  // Form states - Only Name, Phone, and Email (No Home Address!)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // UI state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)

    // Load Razorpay Checkout.js script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  const grandTotalPaise = getTotalPaise()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add fireworks before checking out.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create order on backend (Pay & Get In Store - No address needed)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress: 'Store Pickup - Counter Collection (Diwali Kadai Outlet)',
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors)
        }
        setErrorMessage(data.error || 'Failed to create order. Please check your information.')
        setIsSubmitting(false)
        return
      }

      // 2. Open Razorpay Checkout modal
      if (!window.Razorpay) {
        setErrorMessage('Payment gateway is loading. Please check your mobile network connection and retry.')
        setIsSubmitting(false)
        return
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Diwali Kadai',
        description: `Order #${data.orderNumber} (Store Pickup)`,
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=128&q=80',
        order_id: data.razorpayOrderId.startsWith('order_sim_') ? undefined : data.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          pickup: 'In-Store Collection',
        },
        theme: {
          color: '#9333ea', // Primary glowing purple
        },
        handler: async function (response: any) {
          // 3. Payment captured -> verify on backend
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id || data.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id || `pay_sim_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || 'sim_sig',
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              clearCart()
              router.push(`/order-confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`)
            } else {
              setErrorMessage(
                verifyData.error ||
                  'Payment verification could not be confirmed. If money was debited, please contact store support with order #' +
                    data.orderNumber
              )
              setIsSubmitting(false)
            }
          } catch (verifyErr) {
            console.error('Error verifying payment:', verifyErr)
            setErrorMessage(
              'Network error during verification. Your order details are saved under #' + data.orderNumber
            )
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
            setErrorMessage('Payment was not completed. Your order remains pending — you can retry anytime.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setIsSubmitting(false)
        setErrorMessage(
          response.error?.description || 'Payment was declined or cancelled. Please try again.'
        )
      })
      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      setErrorMessage('Something went wrong. Please check your network and try again.')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-16 flex items-center justify-center px-4">
          <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-4xl">🎆</span>
            <h2 className="text-xl font-bold text-gray-900 mt-3">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Please add fireworks to your cart before proceeding to checkout.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block w-full py-3 bg-primary-600 text-white rounded-xl font-bold glow-purple text-sm"
            >
              Browse Fireworks Catalog →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Pay & Get in Store
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pay online securely via Razorpay and collect your packed fireworks box at our store counter.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <span className="text-base">⚠️</span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Store Pickup Info & Customer Contact */}
            <div className="lg:col-span-7 space-y-5">
              {/* Prominent Store Pickup Badge Card */}
              <div className="bg-gradient-to-r from-purple-50 via-primary-50/50 to-white rounded-2xl border border-primary-200 p-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-lg flex-shrink-0 glow-purple">
                    🏬
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900">
                        In-Store Pickup & Counter Collection
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        FREE
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Your order will be packed and ready for immediate collection. Just show your <strong>Order ID</strong> and <strong>Mobile Number</strong> at our store counter.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 bg-white/80 px-2.5 py-1 rounded-lg border border-primary-100">
                      <span>📍</span>
                      <span>Diwali Kadai Store Counter — Sivakasi Outlet</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 shadow-xs">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-black">
                    1
                  </span>
                  Your Contact Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full px-4 py-3.5 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
                        fieldErrors.customerName
                          ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={`w-full pl-13 pr-4 py-3.5 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors font-medium ${
                          fieldErrors.customerPhone
                            ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                        }`}
                      />
                    </div>
                    {fieldErrors.customerPhone && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerPhone}</p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Required for store pickup verification and order PDF receipt
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      inputMode="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className={`w-full px-4 py-3.5 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
                        fieldErrors.customerEmail
                          ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                      }`}
                    />
                    {fieldErrors.customerEmail && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items Summary & Pay Action */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <span className="text-xs bg-purple-50 text-primary-700 font-bold px-2.5 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                {/* Items list */}
                <div className="py-3 space-y-2.5 max-h-56 overflow-y-auto divide-y divide-gray-50 border-b border-gray-100">
                  {items.map((item) => (
                    <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[210px]">
                        <span className="w-5 h-5 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 text-[10px]">
                          {item.quantity}×
                        </span>
                        <span className="font-semibold text-gray-900 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-3 space-y-2 text-xs border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(grandTotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Store Counter Pickup</span>
                    <span className="font-bold text-emerald-600">FREE (₹0)</span>
                  </div>
                </div>

                <div className="py-3.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total Payable</span>
                  <span className="text-2xl font-black text-primary-600">
                    {formatPrice(grandTotalPaise)}
                  </span>
                </div>

                {/* Desktop Pay Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hidden sm:flex w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-extrabold rounded-xl glow-purple transition-all duration-200 shadow-md text-sm items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Razorpay...
                    </>
                  ) : (
                    <>
                      <span>Pay {formatPrice(grandTotalPaise)} & Get in Store</span>
                      <span>🔒</span>
                    </>
                  )}
                </button>

                <div className="mt-3 text-center">
                  <p className="text-[11px] text-gray-400">
                    UPI, Google Pay, PhonePe, Cards, NetBanking via Razorpay
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile-Friendly Sticky Bottom Checkout Button */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30 sm:hidden shadow-lg">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-black rounded-xl glow-purple transition-all text-sm flex items-center justify-center gap-2 active:scale-98 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening Payment...
                  </>
                ) : (
                  <>
                    <span>Pay {formatPrice(grandTotalPaise)} (Store Pickup)</span>
                    <span>🔒</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
