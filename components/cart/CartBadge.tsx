'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const [isBumping, setIsBumping] = useState(false)

  const items = useCartStore((s) => s.items)
  const lastAddedTimestamp = useCartStore((s) => s.lastAddedTimestamp)

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

  return (
    <Link
      id="header-cart-btn"
      href="/cart"
      aria-label="View Shopping Cart"
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
    </Link>
  )
}

