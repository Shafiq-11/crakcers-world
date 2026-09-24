'use client'

import { useState, useEffect } from 'react'
import HeroBanner from './HeroBanner'
import CategoryFilter from './CategoryFilter'
import ProductCard, { ProductData } from './ProductCard'
import { FALLBACK_PRODUCTS } from '@/lib/sample-products'
import { categoryDisplayNames } from '@/lib/utils'

export default function ProductCatalog({
  initialProducts = FALLBACK_PRODUCTS,
}: {
  initialProducts?: ProductData[]
}) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured')

  // Fetch updated catalog on mount or when needed
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          if (data.products && data.products.length > 0) {
            setProducts(data.products)
          }
        }
      } catch (err) {
        console.warn('Could not fetch live products, using fallback:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Filtering
  const filteredProducts = products.filter((product) => {
    if (!product.isActive) return false

    // Category filter
    if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
      return false
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = product.name.toLowerCase().includes(q)
      const matchDesc = product.description.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }

    return true
  })

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0 // default
  })

  const currentCategoryTitle =
    selectedCategory === 'ALL'
      ? 'All Fireworks'
      : categoryDisplayNames[selectedCategory] || selectedCategory

  return (
    <div className="w-full pb-28 sm:pb-16 bg-gray-50/40">
      {/* Search & Festive Offer Banner */}
      <HeroBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        {/* Category Scroll Strip */}
        <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md py-2.5 border-b border-gray-100/90 shadow-2xs">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </div>

        {/* Section Header & Sort */}
        <div className="flex items-center justify-between gap-3 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
              {currentCategoryTitle}
            </h2>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {sortedProducts.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-primary-500 cursor-pointer shadow-2xs"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid (Blinkit 2-column mobile layout) */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 mt-4 p-8">
            <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
              🔍
            </div>
            <h3 className="text-base font-bold text-gray-900">No crackers found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              We couldn't find any products matching your query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL')
                setSearchQuery('')
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 mt-2">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
