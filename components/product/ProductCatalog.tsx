'use client'

import { useState, useEffect, useRef } from 'react'
import HeroBanner from './HeroBanner'
import CategoryFilter from './CategoryFilter'
import ProductCard, { ProductData } from './ProductCard'
import { FALLBACK_PRODUCTS } from '@/lib/sample-products'

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
  const catalogRef = useRef<HTMLDivElement>(null)

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

  const scrollToGrid = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Hero section */}
      <HeroBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExploreClick={scrollToGrid}
      />

      {/* Catalog main container */}
      <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sticky Filters & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex-1">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
              }}
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> items
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-900">No crackers found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any products matching your current category or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL')
                setSearchQuery('')
              }}
              className="mt-5 px-5 py-2 text-xs font-bold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
