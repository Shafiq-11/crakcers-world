'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error('Failed to load stats:', e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Store Performance
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Real-time sales, order transactions, and fireworks inventory metrics.
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-gray-400">Total Revenue</span>
                <span className="p-2 bg-purple-50 text-primary-600 rounded-lg text-lg">💰</span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {loading ? '...' : formatPrice(stats?.totalRevenue || 0)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">From verified paid orders</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-gray-400">Total Orders</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">📦</span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {loading ? '...' : stats?.totalOrders || 0}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                {stats?.paidOrdersCount || 0} successfully captured
              </p>
            </div>

            {/* Pending Payments */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-gray-400">Pending Orders</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg">⏳</span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {loading ? '...' : stats?.pendingOrdersCount || 0}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Awaiting checkout completion</p>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-gray-400">Inventory Alert</span>
                <span className="p-2 bg-red-50 text-red-600 rounded-lg text-lg">⚠️</span>
              </div>
              <div className="text-2xl font-black text-red-600">
                {loading ? '...' : stats?.lowStockProductsCount || 0}
              </div>
              <p className="text-[11px] text-red-500 mt-1 font-semibold">Products with stock ≤ 10</p>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
                <p className="text-xs text-gray-400">Latest transactions through the online store</p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Order #</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Items</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        Loading orders...
                      </td>
                    </tr>
                  ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No orders have been placed yet. Place a test order through the storefront!
                      </td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{order.customerName}</div>
                          <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {order.items?.length || 0} products
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
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
                            className="text-xs font-bold text-primary-600 hover:text-primary-800"
                          >
                            View Details
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
