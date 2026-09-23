import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema, formatZodErrors } from '@/lib/validation'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: formatZodErrors(validation.error),
        },
        { status: 400 }
      )
    }

    const newProduct = await prisma.product.create({
      data: validation.data,
    })

    return NextResponse.json({ product: newProduct, success: true }, { status: 201 })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_CREATE]', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
