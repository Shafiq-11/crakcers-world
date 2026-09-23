import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCatalog from '@/components/product/ProductCatalog'
import { prisma } from '@/lib/prisma'
import { FALLBACK_PRODUCTS } from '@/lib/sample-products'

export const dynamic = 'force-dynamic'

async function getInitialProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { price: 'asc' }],
    })
    if (products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category as string,
        imageUrl: p.imageUrl,
        stockQuantity: p.stockQuantity,
        isActive: p.isActive,
      }))
    }
  } catch (err) {
    // If DB isn't reached yet, fallback seamlessly
  }
  return FALLBACK_PRODUCTS
}

export default async function HomePage() {
  const products = await getInitialProducts()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <ProductCatalog initialProducts={products} />
      </main>
      <Footer />
    </div>
  )
}
