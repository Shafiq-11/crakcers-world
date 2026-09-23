'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (e) {
      router.push('/admin/login')
    }
  }

  const navItems = [
    { label: 'Overview', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Products & Inventory', href: '/admin/products' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <span className="font-extrabold text-gray-900 text-base">
                Diwali Kadai <span className="text-primary-600 font-bold text-xs uppercase px-2 py-0.5 bg-primary-50 rounded-md ml-1">Admin</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <span>View Store</span>
              <span className="text-gray-400">↗</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
