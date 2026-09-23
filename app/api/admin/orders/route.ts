import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const searchParam = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (statusParam && ['PENDING', 'PAID', 'FAILED'].includes(statusParam.toUpperCase())) {
      where.paymentStatus = statusParam.toUpperCase() as PaymentStatus
    }

    if (searchParam) {
      const q = searchParam.trim()
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to retrieve orders list' },
      { status: 500 }
    )
  }
}
