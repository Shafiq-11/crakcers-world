'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number // in paise
  quantity: number
  stockQuantity: number
  imageUrl: string
  category: string
}

interface CartStore {
  items: CartItem[]
  isDrawerOpen: boolean
  lastAddedId: string | null
  lastAddedTimestamp: number
  setDrawerOpen: (open: boolean) => void
  addItem: (product: {
    id: string
    name: string
    price: number
    stockQuantity: number
    imageUrl: string
    category: string
  }, quantity?: number) => boolean
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPaise: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      lastAddedId: null,
      lastAddedTimestamp: 0,

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingIndex = items.findIndex((i) => i.productId === product.id)
        const currentQty = existingIndex > -1 ? items[existingIndex].quantity : 0
        const desiredQty = currentQty + quantity

        if (product.stockQuantity <= 0) {
          return false
        }

        const finalQty = Math.min(desiredQty, product.stockQuantity)

        if (existingIndex > -1) {
          const updated = [...items]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: finalQty,
            stockQuantity: product.stockQuantity,
          }
          // Do NOT auto open drawer so user can keep shopping uninterrupted
          set({
            items: updated,
            lastAddedId: product.id,
            lastAddedTimestamp: Date.now(),
          })
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: finalQty,
                stockQuantity: product.stockQuantity,
                imageUrl: product.imageUrl,
                category: product.category,
              },
            ],
            // Do NOT auto open drawer
            lastAddedId: product.id,
            lastAddedTimestamp: Date.now(),
          })
        }
        return true
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const items = get().items.map((item) => {
          if (item.productId === productId) {
            const clamped = Math.min(quantity, item.stockQuantity)
            return { ...item, quantity: clamped }
          }
          return item
        })
        set({ items })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPaise: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'diwali_kadai_cart_v1',
      skipHydration: true,
    }
  )
)
