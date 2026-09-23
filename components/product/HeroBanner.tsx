'use client'

interface HeroBannerProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExploreClick: () => void
}

export default function HeroBanner({
  searchQuery,
  onSearchChange,
  onExploreClick,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white py-12 sm:py-16 md:py-20 border-b border-gray-100">
      {/* Background festive glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-300/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Festive pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 border border-primary-200 text-primary-800 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
          <span>✨</span>
          <span>Diwali 2026 Special Collection</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-ping" />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Light Up Your Festival With{' '}
          <span className="text-primary-600 relative inline-block">
            Premium Fireworks
            <span className="absolute left-0 bottom-1 w-full h-2 bg-primary-200/50 -z-10 rounded-sm" />
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Order genuine Sivakasi crackers directly to your doorstep. Standard low-smoke green crackers, child-safe sparklers, and spectacular sky shots.
        </p>

        {/* Search bar & quick action */}
        <div className="mt-8 sm:mt-10 max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sparklers, rockets, combo boxes..."
              className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl shadow-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 placeholder:text-gray-400"
            />
            <svg
              className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl glow-purple transition-all duration-200 flex-shrink-0 cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>

        {/* Value props badge strip */}
        <div className="mt-12 pt-8 border-t border-gray-100/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left sm:text-center">
          <div className="flex items-center sm:justify-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Certified Green</h4>
              <p className="text-[11px] text-gray-500">CSIR-NEERI Approved</p>
            </div>
          </div>

          <div className="flex items-center sm:justify-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Safe Packaging</h4>
              <p className="text-[11px] text-gray-500">Moisture-proof boxes</p>
            </div>
          </div>

          <div className="flex items-center sm:justify-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Direct Factory</h4>
              <p className="text-[11px] text-gray-500">Best wholesale prices</p>
            </div>
          </div>

          <div className="flex items-center sm:justify-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Razorpay Verified</h4>
              <p className="text-[11px] text-gray-500">100% Secure Payments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
