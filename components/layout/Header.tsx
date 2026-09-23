'use client'

import Link from 'next/link'
import CartBadge from '@/components/cart/CartBadge'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform">
                🪔
              </span>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 block leading-tight">
                  Diwali <span className="text-primary-600">Kadai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block -mt-0.5">
                  Sivakasi Fireworks
                </span>
              </div>
            </Link>

            {/* Navigation links & cart trigger */}
            <div className="flex items-center gap-4 sm:gap-6">
              <nav className="hidden sm:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-xs uppercase font-bold tracking-wider text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Fireworks
                </Link>
                <Link
                  href="/admin"
                  className="text-xs uppercase font-bold tracking-wider text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Admin
                </Link>
              </nav>

              <CartBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out cart drawer */}
      <CartDrawer />
    </>
  )
}
