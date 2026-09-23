'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const getTotalPaise = useCartStore((s) => s.getTotalPaise)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
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
  const shippingPaise = 0
  const grandTotalPaise = subtotalPaise

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-10 sm:py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review your selected fireworks and proceed to secure checkout.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline cursor-pointer"
              >
                Clear Entire Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🛒
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
              <p className="text-sm text-gray-500 mt-2">
                Looks like you haven't added any fireworks yet. Check out our sparklers, flowerpots, and combo hampers!
              </p>
              <Link
                href="/"
                className="mt-6 inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl glow-purple transition-all"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <div className="p-6 divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 mt-1">
                            {item.name}
                          </h3>
                          <p className="text-sm font-semibold text-gray-500 mt-0.5">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>

                      {/* Controls and line total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.stockQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-gray-900 block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="py-4 space-y-3 text-sm border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotalPaise)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Store Counter Pickup</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <p className="text-[11px] text-gray-400 bg-purple-50/70 p-2.5 rounded-lg">
                    🏬 Pay online and collect your packed box at our Sivakasi counter.
                  </p>
                </div>

                <div className="py-4 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total Payable</span>
                  <span className="text-2xl font-extrabold text-primary-600">
                    {formatPrice(grandTotalPaise)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block text-center py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl glow-purple transition-all duration-200 shadow-md"
                >
                  Proceed to Checkout →
                </Link>

                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                    <span>🔒</span> 100% Encrypted & Safe Checkout via Razorpay
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
