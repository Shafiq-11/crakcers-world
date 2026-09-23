'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, categoryDisplayNames } from '@/lib/utils'

export interface ProductData {
  id: string
  name: string
  description: string
  price: number // paise
  category: string
  imageUrl: string
  stockQuantity: number
  isActive: boolean
}

export default function ProductCard({ product }: { product: ProductData }) {
  const [justAdded, setJustAdded] = useState(false)
  const [showFlyingEffect, setShowFlyingEffect] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)

  const cartItem = items.find((i) => i.productId === product.id)
  const inCartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stockQuantity <= 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10

  const handleAddToCart = () => {
    if (isOutOfStock) return

    // Trigger card flying effect animation
    setShowFlyingEffect(true)
    const success = addItem(product, 1)

    if (success) {
      setJustAdded(true)
      setTimeout(() => {
        setJustAdded(false)
        setShowFlyingEffect(false)
      }, 1000)
    }
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:glow-purple transition-all duration-300 flex flex-col overflow-hidden">
      {/* Flying Particle Effect on Add */}
      {showFlyingEffect && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary-600/90 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-purple-400 -translate-y-24 scale-75 opacity-0 transition-all duration-700 ease-out">
            +1
          </div>
        </div>
      )}

      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-gray-50 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-md text-gray-800 rounded-full border border-gray-200/50 shadow-xs">
          {categoryDisplayNames[product.category] || product.category}
        </span>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded-full shadow-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-white rounded-full shadow-xs">
              Only {product.stockQuantity} left
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Price</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            disabled={isOutOfStock || inCartQty >= product.stockQuantity}
            onClick={handleAddToCart}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center gap-1.5 cursor-pointer min-h-[42px] ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : inCartQty >= product.stockQuantity
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-95'
                : 'bg-primary-600 hover:bg-primary-700 text-white glow-purple active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              'Sold Out'
            ) : inCartQty >= product.stockQuantity ? (
              `Max (${inCartQty})`
            ) : justAdded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : inCartQty > 0 ? (
              <>
                <span>Add More ({inCartQty})</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
