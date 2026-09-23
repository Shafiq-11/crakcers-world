import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FALLBACK_PRODUCTS } from '@/lib/sample-products'
import { Category } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')

    let categoryFilter: Category | undefined
    if (categoryParam && Object.values(Category).includes(categoryParam as Category)) {
      categoryFilter = categoryParam as Category
    }

    try {
      const where: any = { isActive: true }
      if (categoryFilter) {
        where.category = categoryFilter
      }
      if (searchParam) {
        where.OR = [
          { name: { contains: searchParam, mode: 'insensitive' } },
          { description: { contains: searchParam, mode: 'insensitive' } },
        ]
      }

      const dbProducts = await prisma.product.findMany({
        where,
        orderBy: [{ category: 'asc' }, { price: 'asc' }],
      })

      if (dbProducts.length > 0) {
        return NextResponse.json({ products: dbProducts, source: 'database' })
      }
    } catch (dbError) {
      console.warn('[PRODUCTS_API] Database query error or empty, using catalog data:', dbError instanceof Error ? dbError.message : 'DB unavailable')
    }

    // Fallback catalog
    let filtered = FALLBACK_PRODUCTS.filter((p) => p.isActive)
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }
    if (searchParam) {
      const query = searchParam.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    return NextResponse.json({ products: filtered, source: 'catalog' })
  } catch (error) {
    console.error('[PRODUCTS_API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    )
  }
}
