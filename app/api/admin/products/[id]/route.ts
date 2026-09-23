import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema, formatZodErrors } from '@/lib/validation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Partial update allowed
    const updated = await prisma.product.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ product: updated, success: true })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_PATCH]', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Deactivate instead of hard deleting to preserve historical order items
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Product deactivated', product })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    )
  }
}
