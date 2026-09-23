'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const getTotalPaise = useCartStore((s) => s.getTotalPaise)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isDrawerOpen])

  if (!mounted || !isDrawerOpen) return null

  const subtotalPaise = getTotalPaise()
  const freeShippingThresholdPaise = 199900 // ₹1,999
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdPaise - subtotalPaise)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <h2 className="text-lg font-bold text-gray-900">Your Diwali Cart</h2>
              <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">
                {items.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Store Pickup Banner */}
          <div className="px-6 py-3 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between text-xs">
            <span className="text-primary-900 font-semibold flex items-center gap-1.5">
              <span>🏬</span> In-Store Pickup (Sivakasi Outlet)
            </span>
            <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
              FREE PICKUP
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-3xl mb-4">
                  🎆
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  Add some sparklers, flowerpots, and rockets to brighten your Diwali celebration!
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold glow-purple transition-all"
                >
                  Explore Crackers
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="py-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.stockQuantity}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-500 hover:text-primary-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(subtotalPaise)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Ready for immediate packing and counter collection.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full text-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white transition-all"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full text-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold glow-purple transition-all"
                >
                  Checkout →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
