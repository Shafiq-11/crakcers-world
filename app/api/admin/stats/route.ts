import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let totalRevenue = 0
    let totalOrders = 0
    let paidOrdersCount = 0
    let pendingOrdersCount = 0
    let totalProducts = 0
    let lowStockProductsCount = 0
    let recentOrders: any[] = []

    try {
      const [
        ordersCount,
        paidCount,
        pendingCount,
        revenueAggregate,
        productsCount,
        lowStockCount,
        recents,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { paymentStatus: 'PAID' } }),
        prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
        prisma.order.aggregate({
          where: { paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.product.count(),
        prisma.product.count({ where: { stockQuantity: { lte: 10 } } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),
      ])

      totalOrders = ordersCount
      paidOrdersCount = paidCount
      pendingOrdersCount = pendingCount
      totalRevenue = revenueAggregate._sum.totalAmount || 0
      totalProducts = productsCount
      lowStockProductsCount = lowStockCount
      recentOrders = recents
    } catch (e) {
      console.warn('[ADMIN_STATS] DB error, using default metrics:', e)
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      paidOrdersCount,
      pendingOrdersCount,
      totalProducts,
      lowStockProductsCount,
      recentOrders,
    })
  } catch (error) {
    console.error('[ADMIN_STATS_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
