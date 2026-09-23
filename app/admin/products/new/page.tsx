'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

const CATEGORIES = [
  { id: 'SPARKLERS', label: 'Sparklers' },
  { id: 'CHAKRAS', label: 'Chakras' },
  { id: 'FLOWERPOTS', label: 'Flowerpots' },
  { id: 'ROCKETS', label: 'Rockets' },
  { id: 'FOUNTAINS', label: 'Fountains' },
  { id: 'BOMBS', label: 'Bombs / Sound Crackers' },
  { id: 'FANCY_ITEMS', label: 'Fancy Items' },
  { id: 'COMBO_PACKS', label: 'Combo Packs' },
]

export default function AdminNewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('SPARKLERS')
  const [priceRupees, setPriceRupees] = useState('')
  const [stockQuantity, setStockQuantity] = useState('50')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const parsedPrice = parseFloat(priceRupees)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price in rupees.')
      return
    }

    const priceInPaise = Math.round(parsedPrice * 100)
    const stock = parseInt(stockQuantity, 10)

    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          price: priceInPaise,
          stockQuantity: isNaN(stock) ? 0 : Math.max(0, stock),
          imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
          isActive,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create product')
      }
    } catch (err) {
      setError('Connection error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Add New Fireworks Product
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Enter product specifications to publish to the Diwali catalog.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-xs font-bold text-gray-500 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 50 Shots Golden Crown Fireworks"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Price in INR (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      placeholder="250.00"
                      className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900 font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Stored accurately as paise on backend
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details on flame color, sound profile, duration, safety instructions..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 text-gray-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Publish product immediately to storefront (Active)
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold text-sm rounded-xl glow-purple transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? 'Publishing Product...' : 'Create & Publish Firework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
