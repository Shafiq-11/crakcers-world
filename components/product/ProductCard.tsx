'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, categoryDisplayNames } from '@/lib/utils'

export interface ProductData {
  id: string
  name: string
  description: string
  price: number // in paise
  category: string
  imageUrl: string
  stockQuantity: number
  isActive: boolean
}

export default function ProductCard({ product }: { product: ProductData }) {
  const [isBumping, setIsBumping] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const items = useCartStore((s) => s.items)

  const cartItem = items.find((i) => i.productId === product.id)
  const inCartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stockQuantity <= 0

  // Calculate simulated MRP (around 30% higher) to give standard festive cracker discount display
  const originalMrpPaise = Math.round((product.price * 1.35) / 100) * 100

  // Extract pack size if present in name (e.g., "(Box of 10)", "(Pack of 5)")
  const packMatch = product.name.match(/\((.*?)\)/)
  const packInfo = packMatch ? packMatch[1] : '1 Unit'
  const cleanTitle = product.name.replace(/\(.*?\)/, '').trim()

  const triggerFlyAnimation = (targetEl?: HTMLElement) => {
    if (typeof window === 'undefined' || !targetEl) return
    const targetCart = document.getElementById('header-cart-btn')
    if (!targetCart) return

    const sourceRect = targetEl.getBoundingClientRect()
    const cartRect = targetCart.getBoundingClientRect()

    const flyingEl = document.createElement('div')
    flyingEl.innerText = '✨'
    flyingEl.style.position = 'fixed'
    flyingEl.style.left = `${sourceRect.left + sourceRect.width / 2}px`
    flyingEl.style.top = `${sourceRect.top}px`
    flyingEl.style.zIndex = '9999'
    flyingEl.style.pointerEvents = 'none'
    flyingEl.style.fontSize = '20px'
    flyingEl.style.transition = 'all 0.55s cubic-bezier(0.2, 0.9, 0.3, 1)'
    flyingEl.style.transform = 'translate(-50%, -50%) scale(1.4)'
    flyingEl.style.filter = 'drop-shadow(0 0 6px #9333ea)'
    document.body.appendChild(flyingEl)

    requestAnimationFrame(() => {
      flyingEl.style.left = `${cartRect.left + cartRect.width / 2}px`
      flyingEl.style.top = `${cartRect.top + cartRect.height / 2}px`
      flyingEl.style.transform = 'translate(-50%, -50%) scale(0.3)'
      flyingEl.style.opacity = '0'
    })

    setTimeout(() => {
      flyingEl.remove()
    }, 600)
  }

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOutOfStock) return
    triggerFlyAnimation(e.currentTarget)
    setIsBumping(true)
    addItem(product, 1)
    setTimeout(() => setIsBumping(false), 300)
  }

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (inCartQty >= product.stockQuantity) return
    triggerFlyAnimation(e.currentTarget)
    setIsBumping(true)
    updateQuantity(product.id, inCartQty + 1)
    setTimeout(() => setIsBumping(false), 300)
  }

  const handleDecrement = () => {
    setIsBumping(true)
    updateQuantity(product.id, inCartQty - 1)
    setTimeout(() => setIsBumping(false), 300)
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100/90 hover:border-primary-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden p-3 relative">
      {/* Product Image & Badges */}
      <div>
        <div className="relative aspect-square w-full rounded-xl bg-gray-50/80 overflow-hidden mb-2.5">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Category Tag */}
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-white/95 backdrop-blur-xs text-gray-700 rounded-md border border-gray-200/50 shadow-2xs">
            {categoryDisplayNames[product.category] || product.category}
          </span>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
              <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-red-600 text-white rounded-lg shadow-xs">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Pack / Size indicator (Blinkit style) */}
        <div className="text-[11px] text-gray-500 font-semibold mb-1">
          {packInfo}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[32px]">
          {cleanTitle}
        </h3>
      </div>

      {/* Pricing & Blinkit Action Button */}
      <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-gray-900 leading-none">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(originalMrpPaise)}
            </span>
          </div>
          <span className="text-[9px] font-bold text-emerald-600 tracking-tight mt-0.5">
            Save {formatPrice(originalMrpPaise - product.price)}
          </span>
        </div>

        {/* Iconic Blinkit Stepper Button */}
        <div>
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            >
              Out
            </button>
          ) : inCartQty === 0 ? (
            <button
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-black tracking-wide bg-white hover:bg-primary-50 text-primary-700 border-2 border-primary-500 hover:border-primary-600 glow-purple transition-all duration-150 active:scale-90 shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : (
            <div
              className={`flex items-center rounded-xl bg-primary-600 text-white shadow-sm glow-purple overflow-hidden transition-transform duration-150 ${
                isBumping ? 'scale-105' : ''
              }`}
            >
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-black hover:bg-primary-700 active:scale-90 transition-colors"
              >
                −
              </button>
              <span className="px-1.5 text-xs font-black min-w-5 text-center">
                {inCartQty}
              </span>
              <button
                onClick={handleIncrement}
                disabled={inCartQty >= product.stockQuantity}
                aria-label="Increase quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-black hover:bg-primary-700 active:scale-90 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
