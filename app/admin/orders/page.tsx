'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { formatPrice } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (e) {
      console.error('Failed to load orders:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadOrders()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Order Management
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Search, inspect, and verify customer payments and delivery addresses.
              </p>
            </div>

            <button
              onClick={loadOrders}
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              🔄 Refresh List
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Filter Tabs */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['ALL', 'PAID', 'PENDING', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-primary-600 text-white glow-purple'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer, phone..."
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Order Number</th>
                    <th className="py-3 px-6">Customer & Contact</th>
                    <th className="py-3 px-6">Placed At</th>
                    <th className="py-3 px-6">Items</th>
                    <th className="py-3 px-6">Total Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Fetching orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        No matching orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {order.orderNumber}
                          {order.razorpayPaymentId && (
                            <div className="text-[10px] text-gray-400 font-normal truncate max-w-[140px]">
                              Pay ID: {order.razorpayPaymentId}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{order.customerName}</div>
                          <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                          <div className="text-[11px] text-gray-400">{order.customerEmail}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <span className="font-semibold">{order.items?.length || 0} items</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.paymentStatus === 'FAILED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-bold text-gray-700 transition-colors"
                          >
                            Inspect →
                          </Link>
                        </td>
                      </tr>
                    ))
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
