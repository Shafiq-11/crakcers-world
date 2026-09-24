'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const [isBumping, setIsBumping] = useState(false)

  const items = useCartStore((s) => s.items)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const lastAddedTimestamp = useCartStore((s) => s.lastAddedTimestamp)
  const getTotalPaise = useCartStore((s) => s.getTotalPaise)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  // Trigger bounce animation when an item is added
  useEffect(() => {
    if (lastAddedTimestamp > 0) {
      setIsBumping(true)
      const timer = setTimeout(() => setIsBumping(false), 600)
      return () => clearTimeout(timer)
    }
  }, [lastAddedTimestamp])

  const totalItems = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0
  const subtotalPaise = mounted ? getTotalPaise() : 0

  return (
    <>
      {/* Top Header Cart Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Open Shopping Cart"
        className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border transition-all duration-200 text-gray-800 bg-white shadow-2xs cursor-pointer ${
          isBumping
            ? 'scale-105 border-primary-500 shadow-md shadow-purple-200 ring-2 ring-primary-300'
            : 'border-gray-200 hover:border-primary-500'
        }`}
      >
        <div className="relative">
          <svg
            className={`w-5 h-5 transition-transform ${isBumping ? 'rotate-12 text-primary-600' : 'text-gray-700'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>

          {isBumping && (
            <span className="absolute -top-3 -right-2 text-[10px] font-black text-primary-600 animate-ping">
              +1
            </span>
          )}
        </div>

        <span className="text-xs sm:text-sm font-bold">Cart</span>

        {totalItems > 0 && (
          <span
            className={`flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-black text-white bg-primary-600 rounded-full transition-transform ${
              isBumping ? 'scale-125 glow-purple' : ''
            }`}
          >
            {totalItems}
          </span>
        )}
      </button>

      {/* Iconic Blinkit Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 sm:max-w-md animate-fade-in">
          <div
            onClick={() => setDrawerOpen(true)}
            className="w-full bg-gradient-to-r from-gray-950 via-gray-900 to-purple-950 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all hover:shadow-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-black glow-purple shadow-sm">
                🛍️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-200">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm font-black text-white">
                    {formatPrice(subtotalPaise)}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  ⚡ Ready for In-Store Pickup
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black rounded-xl glow-purple shadow-md transition-all">
              <span>View Cart</span>
              <span className="text-sm">→</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
