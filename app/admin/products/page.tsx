'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (e) {
      console.error('Failed to load products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleStockChange = (productId: string, val: string) => {
    const num = parseInt(val, 10)
    setStockEdits((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }))
  }

  const saveStock = async (product: any) => {
    const newStock = stockEdits[product.id]
    if (newStock === undefined || newStock === product.stockQuantity) return

    setSavingId(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      })

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: newStock } : p))
        )
      }
    } catch (e) {
      console.error('Failed to save stock:', e)
    } finally {
      setSavingId(null)
    }
  }

  const toggleProductActive = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
        )
      }
    } catch (e) {
      console.error('Failed to toggle status:', e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Products & Inventory Control
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage firework pricing, real-time stock levels, and store visibility.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/admin/products/new"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl glow-purple transition-all shadow-xs"
              >
                + Add Firework Item
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Price</th>
                    <th className="py-3 px-6">Stock Quantity</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading inventory...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        No products found in the database. Run seed script or add one.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const currentVal =
                        stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stockQuantity
                      const hasChanged =
                        stockEdits[p.id] !== undefined && stockEdits[p.id] !== p.stockQuantity

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block">{p.name}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                                  {p.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-4 px-6 font-bold text-gray-900">
                            {formatPrice(p.price)}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={currentVal}
                                onChange={(e) => handleStockChange(p.id, e.target.value)}
                                className={`w-20 px-2 py-1 border rounded-lg text-xs font-bold text-center ${
                                  currentVal === 0
                                    ? 'border-red-300 bg-red-50 text-red-700'
                                    : currentVal <= 10
                                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                                    : 'border-gray-200 text-gray-900'
                                }`}
                              />
                              {hasChanged && (
                                <button
                                  onClick={() => saveStock(p)}
                                  disabled={savingId === p.id}
                                  className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[10px] font-bold"
                                >
                                  {savingId === p.id ? '...' : 'Save'}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleProductActive(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                p.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {p.isActive ? 'Active (Live)' : 'Hidden (Draft)'}
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => toggleProductActive(p)}
                              className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                            >
                              {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
