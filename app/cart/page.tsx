'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, categoryDisplayNames } from '@/lib/utils'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalPaise = getTotalPaise()
  // Calculate simulated MRP savings (around 30-35% higher)
  const totalMrpPaise = Math.round((subtotalPaise * 1.35) / 100) * 100
  const savingsPaise = totalMrpPaise - subtotalPaise

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1 py-4 sm:py-8 pb-28 sm:pb-16">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Action Bar */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors"
            >
              <span>←</span>
              <span>Back to Store</span>
            </Link>

            {items.length > 0 && (
              <div>
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">Clear all items?</span>
                    <button
                      onClick={() => {
                        clearCart()
                        setShowClearConfirm(false)
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Page Title & Items Counter */}
          <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Review Your Cart
            </h1>
            {totalItems > 0 && (
              <span className="text-xs font-extrabold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs mt-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4">
                🛒
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                You haven&apos;t added any crackers yet. Browse our Sivakasi fireworks collection and get ready for a sparkling Diwali!
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-extrabold rounded-xl glow-purple transition-all shadow-md"
              >
                <span>🎆</span>
                <span>Explore Crackers Catalog</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
              {/* Left Column: Store Pickup Notice + Cart Items */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {/* Store Pickup Banner */}
                <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/60 border border-purple-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                    🏬
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs sm:text-sm font-extrabold text-gray-900">
                        In-Store Pickup Only
                      </h2>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        FREE
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-snug">
                      Pay safely online. Your order box will be verified, packed, and kept ready at our <strong>Sivakasi outlet counter in 15 mins</strong>.
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemSubtotalPaise = item.price * item.quantity
                    const itemMrpPaise = Math.round((item.price * 1.35) / 100) * 100

                    return (
                      <div
                        key={item.productId}
                        className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Thumbnail & Product Details */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                              {categoryDisplayNames[item.category] || item.category}
                            </span>
                            <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1 line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-xs sm:text-sm font-black text-gray-900">
                                {formatPrice(item.price)}
                              </span>
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatPrice(itemMrpPaise)}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
                                / pack
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls & Line Subtotal */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          {/* Easy-to-use Qty Stepper */}
                          <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-black text-gray-600 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs sm:text-sm font-black text-gray-900 min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              disabled={item.quantity >= item.stockQuantity}
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-black text-gray-600 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Subtotal & Remove */}
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">
                              {formatPrice(itemSubtotalPaise)}
                            </span>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:underline mt-0.5 cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary / Bill Details */}
              <div className="lg:col-span-5 sticky top-20 space-y-3">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <span>Bill Details</span>
                    <span className="text-xs font-semibold text-gray-400">Prices in INR</span>
                  </h2>

                  <div className="py-3 sm:py-4 space-y-2.5 text-xs sm:text-sm border-b border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>Total MRP</span>
                      <span className="line-through text-gray-400">{formatPrice(totalMrpPaise)}</span>
                    </div>

                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span className="flex items-center gap-1">
                        <span>🏷️</span>
                        <span>Diwali Kadai Savings</span>
                      </span>
                      <span>- {formatPrice(savingsPaise)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Items Subtotal</span>
                      <span className="font-extrabold text-gray-900">{formatPrice(subtotalPaise)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>In-Store Counter Pickup</span>
                      <span className="font-extrabold text-emerald-600">FREE (₹0.00)</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>GST & Safety Packaging</span>
                      <span className="text-gray-500 font-medium">Included</span>
                    </div>
                  </div>

                  {/* Final Total Row */}
                  <div className="py-3.5 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                        To Pay
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        You save {formatPrice(savingsPaise)} on this order
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-gray-900">
                      {formatPrice(subtotalPaise)}
                    </span>
                  </div>

                  {/* Large Prominent Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full mt-2 py-3.5 sm:py-4 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl glow-purple transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Store Pickup</span>
                    <span className="text-base font-black">→</span>
                  </Link>

                  {/* Safety & Payment Assurance */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-center">
                    <p className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1">
                      <span>🔒</span>
                      <span>100% Encrypted & Safe Razorpay Checkout</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Supports UPI (GPay, PhonePe, Paytm), Cards & NetBanking
                    </p>
                  </div>
                </div>

                {/* Sivakasi Outlet Counter Info Card */}
                <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 text-xs text-purple-900 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Sivakasi Outlet Counter Details:</span>
                  </p>
                  <p className="text-[11px] text-purple-800">
                    Open 8:00 AM – 10:00 PM • Show your order PDF receipt at the counter for priority 15-minute package handover.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Checkout Bar (appears on phones when cart has items) */}
      {items.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
              Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
            <span className="text-base font-black text-gray-900">
              {formatPrice(subtotalPaise)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-black text-xs rounded-xl glow-purple transition-all shadow-md text-center flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Pickup</span>
            <span>→</span>
          </Link>
        </div>
      )}

      <Footer />
    </div>
  )
}
