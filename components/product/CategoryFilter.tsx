'use client'

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Crackers', emoji: '🌟' },
  { id: 'SPARKLERS', label: 'Sparklers', emoji: '✨' },
  { id: 'CHAKRAS', label: 'Chakras', emoji: '🌀' },
  { id: 'FLOWERPOTS', label: 'Flowerpots', emoji: '🌺' },
  { id: 'ROCKETS', label: 'Rockets', emoji: '🚀' },
  { id: 'FOUNTAINS', label: 'Fountains', emoji: '🌋' },
  { id: 'BOMBS', label: 'Sound Bombs', emoji: '💣' },
  { id: 'FANCY_ITEMS', label: 'Aerial Shots', emoji: '🎆' },
  { id: 'COMBO_PACKS', label: 'Gift Boxes', emoji: '🎁' },
]

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max py-0.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs glow-purple'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs'
              }`}
            >
              <span className="text-xs sm:text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
