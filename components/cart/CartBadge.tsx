'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  const totalItems = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0

  return (
    <button
      onClick={() => setDrawerOpen(true)}
      aria-label="Open Shopping Cart"
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary-500 hover:shadow-sm transition-all text-gray-700 hover:text-primary-600 bg-white"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="text-sm font-semibold">Cart</span>
      {totalItems > 0 && (
        <span className="flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-primary-600 rounded-full glow-purple animate-pulse">
          {totalItems}
        </span>
      )}
    </button>
  )
}
