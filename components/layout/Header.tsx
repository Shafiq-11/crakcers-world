'use client'

import Link from 'next/link'
import CartBadge from '@/components/cart/CartBadge'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* Store Branding & Quick Pickup Tag (Blinkit Style) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform">
                  🪔
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-xl font-black tracking-tight text-gray-900 leading-none">
                      Diwali <span className="text-primary-600">Kadai</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      15 min
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">• Sivakasi Outlet</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Cart & Quick Access */}
            <div className="flex items-center gap-2 sm:gap-4">
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
