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

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

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

  const subtotalPaise = getTotalPaise()
  const shippingPaise = subtotalPaise >= 199900 || subtotalPaise === 0 ? 0 : 15000
  const grandTotalPaise = subtotalPaise + shippingPaise

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create order on backend (server calculates real totals)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress,
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
        setErrorMessage(data.error || 'Failed to create order. Please check the form.')
        setIsSubmitting(false)
        return
      }

      // 2. Open Razorpay Checkout modal
      if (!window.Razorpay) {
        setErrorMessage('Payment SDK is still loading. Please check your internet connection and try again.')
        setIsSubmitting(false)
        return
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Diwali Kadai',
        description: `Fireworks Order #${data.orderNumber}`,
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
        },
        theme: {
          color: '#9333ea', // Primary glowing purple
        },
        handler: async function (response: any) {
          // 3. Payment captured by Razorpay -> verify on server via HMAC
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
              setErrorMessage(verifyData.error || 'Payment verification could not be confirmed. If money was debited, please contact support with order number ' + data.orderNumber)
              setIsSubmitting(false)
            }
          } catch (verifyErr) {
            console.error('Error verifying payment:', verifyErr)
            setErrorMessage('Network error during verification. Your order details have been saved under ' + data.orderNumber)
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
            setErrorMessage('Payment was not completed. Your order remains pending — you can try again anytime.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setIsSubmitting(false)
        setErrorMessage(
          response.error?.description || 'Payment failed. Please check your bank account or card balance and try again.'
        )
      })
      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      setErrorMessage('Something went wrong during checkout. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <span className="text-4xl">🎆</span>
            <h2 className="text-xl font-bold text-gray-900 mt-3">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mt-2">
              You need to add fireworks to your cart before proceeding to checkout.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg font-bold glow-purple"
            >
              Browse Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Express Checkout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Safe & licensed delivery straight from Sivakasi to your doorstep.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Delivery & Customer Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span>1.</span> Customer Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
                        fieldErrors.customerName
                          ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        WhatsApp / Mobile *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-xs font-bold text-gray-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
                            fieldErrors.customerPhone
                              ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                          }`}
                        />
                      </div>
                      {fieldErrors.customerPhone && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
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

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span>2.</span> Delivery Address
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Complete Street Address & Pincode *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House/Flat number, Street name, Landmark, City, State, and 6-digit Pincode"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none transition-colors ${
                      fieldErrors.deliveryAddress
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                  />
                  {fieldErrors.deliveryAddress && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.deliveryAddress}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Please provide an exact landmark and active contact number for courier dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items & Razorpay Payment Action */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <h2 className="text-base font-bold text-gray-900 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <span>Your Order</span>
                  <span className="text-xs text-gray-400 font-normal">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </h2>

                {/* Items preview list */}
                <div className="py-4 space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-50 border-b border-gray-100">
                  {items.map((item) => (
                    <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 truncate max-w-[240px]">
                        <span className="w-5 h-5 rounded-sm bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 text-[10px]">
                          {item.quantity}×
                        </span>
                        <span className="font-medium text-gray-800 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-4 space-y-2.5 text-xs border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Festive Delivery</span>
                    {shippingPaise === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-gray-900">{formatPrice(shippingPaise)}</span>
                    )}
                  </div>
                </div>

                <div className="py-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total Payable</span>
                  <span className="text-2xl font-extrabold text-primary-600">
                    {formatPrice(grandTotalPaise)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-extrabold rounded-xl glow-purple transition-all duration-200 shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Secure Payment...
                    </>
                  ) : (
                    <>
                      <span>Pay {formatPrice(grandTotalPaise)} via Razorpay</span>
                      <span>🔒</span>
                    </>
                  )}
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center space-y-2">
                  <p className="text-[11px] text-gray-400">
                    Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                    <span>⚡ 256-Bit SSL</span>
                    <span>•</span>
                    <span>Verified Fireworks License</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
