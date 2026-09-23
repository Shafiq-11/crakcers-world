import { z } from 'zod'

// Checkout form validation
export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  customerEmail: z
    .string()
    .email('Enter a valid email address')
    .max(254, 'Email is too long'),
  deliveryAddress: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be at most 500 characters')
    .trim(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z
          .number()
          .int('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1')
          .max(100, 'Maximum 100 per item'),
      })
    )
    .min(1, 'Cart cannot be empty')
    .max(50, 'Too many items in cart'),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// Admin login validation
export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50).trim(),
  password: z.string().min(1, 'Password is required').max(128),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>

// Product form validation (admin)
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name is too long')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long')
    .trim(),
  price: z
    .number()
    .int('Price must be in paise (whole number)')
    .min(100, 'Minimum price is ₹1 (100 paise)')
    .max(10000000, 'Maximum price is ₹1,00,000'),
  category: z.enum([
    'SPARKLERS',
    'ROCKETS',
    'FLOWERPOTS',
    'CHAKRAS',
    'COMBO_PACKS',
    'FOUNTAINS',
    'BOMBS',
    'FANCY_ITEMS',
  ]),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  stockQuantity: z
    .number()
    .int()
    .min(0, 'Stock cannot be negative')
    .max(99999, 'Stock too high'),
  isActive: z.boolean(),
})

export type ProductInput = z.infer<typeof productSchema>

/**
 * Format validation errors into a flat object for form display.
 */
export function formatZodErrors(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}
