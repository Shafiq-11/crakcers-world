/**
 * Format price from paise to display string with ₹ symbol.
 * Example: 15000 -> "₹150.00"
 */
export function formatPrice(paise: number): string {
  return '₹' + (paise / 100).toFixed(2)
}

/**
 * Generate a human-readable order number.
 * Format: DK-YYYYMMDD-XXXX (e.g., DK-20261015-A3F2)
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const datePart = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DK-${datePart}-${randomPart}`
}

/**
 * Category display names for UI.
 */
export const categoryDisplayNames: Record<string, string> = {
  SPARKLERS: 'Sparklers',
  ROCKETS: 'Rockets',
  FLOWERPOTS: 'Flowerpots',
  CHAKRAS: 'Chakras',
  COMBO_PACKS: 'Combo Packs',
  FOUNTAINS: 'Fountains',
  BOMBS: 'Bombs',
  FANCY_ITEMS: 'Fancy Items',
}

/**
 * Category gradient colors for placeholder images.
 */
export const categoryColors: Record<string, { from: string; to: string }> = {
  SPARKLERS: { from: '#fbbf24', to: '#f59e0b' },
  ROCKETS: { from: '#ef4444', to: '#dc2626' },
  FLOWERPOTS: { from: '#10b981', to: '#059669' },
  CHAKRAS: { from: '#8b5cf6', to: '#7c3aed' },
  COMBO_PACKS: { from: '#f97316', to: '#ea580c' },
  FOUNTAINS: { from: '#06b6d4', to: '#0891b2' },
  BOMBS: { from: '#64748b', to: '#475569' },
  FANCY_ITEMS: { from: '#ec4899', to: '#db2777' },
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
