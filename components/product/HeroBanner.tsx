'use client'

interface HeroBannerProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExploreClick?: () => void
}

export default function HeroBanner({
  searchQuery,
  onSearchChange,
}: HeroBannerProps) {
  return (
    <section className="bg-white border-b border-gray-100 pb-2 pt-2 sm:pt-4 sm:pb-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Quick-Commerce Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto mb-2 sm:mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "sparklers", "flowerpots", "rockets"...'
            className="w-full pl-9 sm:pl-11 pr-8 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50/90 border border-gray-200/80 rounded-xl shadow-2xs focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
          />
          <svg
            className="absolute left-3 top-2.5 sm:top-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 sm:top-2.5 text-xs text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Festive Promo Card (Slim on mobile so products stay in frame) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-700 via-primary-600 to-purple-800 p-2 sm:p-5 text-white shadow-xs">
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-2xl">🎆</span>
              <div>
                <p className="text-xs sm:text-base font-black tracking-tight leading-tight">
                  Diwali 2026 Sivakasi Direct Factory Prices
                </p>
                <p className="text-[10px] sm:text-xs text-purple-100 hidden sm:block mt-0.5">
                  100% Certified Green Crackers • Pay Online & Collect at Store Counter
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-md whitespace-nowrap">
              ⚡ 15m Pickup
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
