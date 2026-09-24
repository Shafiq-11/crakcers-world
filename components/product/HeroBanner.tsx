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
    <section className="bg-white border-b border-gray-100 pb-3 pt-3 sm:pt-6 sm:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Prominent Quick-Commerce Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto mb-3 sm:mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "sparklers", "flowerpots", "rockets"...'
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm bg-gray-50/90 border border-gray-200/80 rounded-2xl shadow-2xs focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
          />
          <svg
            className="absolute left-3.5 top-3.5 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
              className="absolute right-3.5 top-3 sm:top-3.5 text-xs text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Blinkit Festive Promo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-primary-600 to-purple-800 p-4 sm:p-6 text-white shadow-md">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-purple-100 mb-1.5">
                <span>⚡</span>
                <span>Fast Counter Pickup • 15 Mins</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                Diwali 2026 Sivakasi Fireworks 🎆
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/90 mt-0.5 font-medium">
                100% Certified Green Crackers • Factory Wholesale Prices
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 self-start sm:self-auto">
              <span>🏬</span>
              <span>Pay Online & Pick Up Ready Box</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
