'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

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
  const [isSaved, setIsSaved] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const items = useCartStore((s) => s.items)

  const cartItem = items.find((i) => i.productId === product.id)
  const inCartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stockQuantity <= 0

  // Calculate simulated MRP (around 30-35% higher) for the strike-through
  const originalMrpPaise = Math.round((product.price * 1.35) / 100) * 100
  const discountPercent = Math.max(5, Math.round(((originalMrpPaise - product.price) / originalMrpPaise) * 100))

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
    flyingEl.style.fontSize = '18px'
    flyingEl.style.transition = 'all 0.55s cubic-bezier(0.2, 0.9, 0.3, 1)'
    flyingEl.style.transform = 'translate(-50%, -50%) scale(1.3)'
    flyingEl.style.filter = 'drop-shadow(0 0 6px #9333ea)'
    document.body.appendChild(flyingEl)

    requestAnimationFrame(() => {
      flyingEl.style.left = `${cartRect.left + cartRect.width / 2}px`
      flyingEl.style.top = `${cartRect.top + cartRect.height / 2}px`
      flyingEl.style.transform = 'translate(-50%, -50%) scale(0.2)'
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
    <div className="group bg-white rounded-xl border border-gray-150/90 hover:border-primary-400 hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden p-1.5 sm:p-2.5 relative">
      {/* Product Image Box */}
      <div>
        <div className="relative aspect-square w-full rounded-lg bg-gray-50/90 overflow-hidden mb-1.5 flex items-center justify-center p-1">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Wishlist Heart Icon (Top Right, matching reference image) */}
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            aria-label="Wishlist"
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg
              className={`w-3 h-3 ${isSaved ? 'fill-red-500 text-red-500' : 'fill-none stroke-current'}`}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Sivakasi Green Dot mark (Bottom Right of Image, like screenshot's veg dot mark) */}
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-white rounded-xs border border-emerald-600 flex items-center justify-center p-0.5 shadow-2xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center">
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-600 text-white rounded">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Pack Info & ADD Button Row (exactly like screenshot) */}
        <div className="flex items-center justify-between gap-1 mb-1 min-h-[22px]">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate max-w-[50px] sm:max-w-none">
            {packInfo}
          </span>

          {/* ADD Button or Stepper */}
          <div>
            {isOutOfStock ? (
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-gray-400 bg-gray-100 rounded">
                Out
              </span>
            ) : inCartQty === 0 ? (
              <button
                onClick={handleAdd}
                aria-label={`Add ${product.name} to cart`}
                className="px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wide text-primary-700 bg-white border border-primary-500 hover:bg-primary-50 active:scale-90 transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
              >
                <span>ADD</span>
                <span className="text-[11px] font-bold leading-none">+</span>
              </button>
            ) : (
              <div
                className={`flex items-center rounded-md bg-primary-600 text-white shadow-2xs overflow-hidden transition-transform duration-150 ${
                  isBumping ? 'scale-105' : ''
                }`}
              >
                <button
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-xs font-black hover:bg-primary-700 active:scale-90 transition-colors"
                >
                  −
                </button>
                <span className="px-1 text-[10px] sm:text-xs font-black min-w-3.5 text-center">
                  {inCartQty}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={inCartQty >= product.stockQuantity}
                  aria-label="Increase quantity"
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-xs font-black hover:bg-primary-700 active:scale-90 transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Row: Bold price & Strikethrough MRP */}
        <div className="flex items-baseline gap-1 leading-none mt-1">
          <span className="text-xs sm:text-sm font-extrabold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
            {formatPrice(originalMrpPaise)}
          </span>
        </div>

        {/* Discount Label (e.g., 25% OFF) */}
        <div className="text-[8px] sm:text-[9px] font-bold text-emerald-600 mt-0.5 leading-none">
          {discountPercent}% OFF
        </div>

        {/* Product Title (2 lines clamp, compact) */}
        <h3
          className="font-medium text-gray-900 text-[10px] sm:text-xs leading-snug line-clamp-2 mt-1 min-h-[26px] sm:min-h-[30px]"
          title={cleanTitle}
        >
          {cleanTitle}
        </h3>
      </div>

      {/* Sub-Badges (Sivakasi Outlet + Rating) */}
      <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-gray-50 text-[8px] sm:text-[9px] text-gray-500">
        <span className="bg-purple-50 text-primary-700 font-bold px-1 py-0.2 rounded text-[8px] truncate">
          ⚡ 15m
        </span>
        <span className="text-amber-500 font-bold flex items-center gap-0.5">
          ⭐ 4.9
        </span>
      </div>
    </div>
  )
}
