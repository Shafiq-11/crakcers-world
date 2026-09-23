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
      const timer = setTimeout(() => setIsBumping(false), 800)
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
        className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all duration-300 text-gray-800 bg-white shadow-xs cursor-pointer ${
          isBumping
            ? 'scale-110 border-primary-500 shadow-lg shadow-purple-200 ring-2 ring-primary-400'
            : 'border-gray-200 hover:border-primary-500 hover:shadow-sm'
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

      {/* Mobile-Friendly Sticky Bottom Cart Bar (When Cart Has Items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-black glow-purple">
                {totalItems}
              </span>
              <div>
                <span className="text-xs text-gray-300 block">Total In Cart</span>
                <span className="text-sm font-extrabold text-white">
                  {formatPrice(subtotalPaise)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-extrabold rounded-xl glow-purple shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>View Cart</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
