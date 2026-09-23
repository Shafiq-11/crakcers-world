'use client'

import { categoryDisplayNames } from '@/lib/utils'

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Fireworks' },
  { id: 'SPARKLERS', label: 'Sparklers' },
  { id: 'CHAKRAS', label: 'Ground Chakras' },
  { id: 'FLOWERPOTS', label: 'Flowerpots' },
  { id: 'ROCKETS', label: 'Sky Rockets' },
  { id: 'FOUNTAINS', label: 'Fountains' },
  { id: 'BOMBS', label: 'Sound Crackers' },
  { id: 'FANCY_ITEMS', label: 'Fancy & Aerials' },
  { id: 'COMBO_PACKS', label: 'Combo Hampers' },
]

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-md glow-purple scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
