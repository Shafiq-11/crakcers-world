import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  // SPARKLERS
  {
    name: '10cm Electric Sparklers (Box of 10)',
    description: 'Classic dazzling golden electric sparklers with crackling sound. Safe for kids with adult supervision. Burn time: 45 seconds each.',
    price: 8500, // ₹85.00
    category: Category.SPARKLERS,
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
    stockQuantity: 150,
    isActive: true,
  },
  {
    name: '15cm Multi-Color Sparklers (Box of 10)',
    description: 'Vibrant sparklers that emit dazzling flashes of red, green, and gold. High grade magnesium wires.',
    price: 14000, // ₹140.00
    category: Category.SPARKLERS,
    imageUrl: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&q=80',
    stockQuantity: 120,
    isActive: true,
  },
  {
    name: '30cm Giant Gold Sparklers (Box of 5)',
    description: 'Extra long sparkling display lasting over 2 minutes per stick. Perfect for family celebrations and memorable photos.',
    price: 22000, // ₹220.00
    category: Category.SPARKLERS,
    imageUrl: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&q=80',
    stockQuantity: 80,
    isActive: true,
  },

  // CHAKRAS
  {
    name: 'Ground Chakkars Deluxe (Pack of 10)',
    description: 'Fast-spinning ground wheels creating mesmerizing spirals of silver and gold fire rings.',
    price: 18000, // ₹180.00
    category: Category.CHAKRAS,
    imageUrl: 'https://images.unsplash.com/photo-1533230307785-5fe068595eb2?w=600&q=80',
    stockQuantity: 100,
    isActive: true,
  },
  {
    name: 'Special Red & Green Whirlwind Chakkars (Pack of 10)',
    description: 'Dual-speed rotating disc that changes from ruby red to emerald green with crackling sparks.',
    price: 26000, // ₹260.00
    category: Category.CHAKRAS,
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80',
    stockQuantity: 75,
    isActive: true,
  },

  // FLOWERPOTS
  {
    name: 'Flowerpot Big Golden Shower (Pack of 10)',
    description: 'Grand fountain shooting gold stars up to 10 feet with a crackling finale.',
    price: 29000, // ₹290.00
    category: Category.FLOWERPOTS,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
    stockQuantity: 90,
    isActive: true,
  },
  {
    name: 'Color Fountain Flowerpots (Pack of 5)',
    description: 'Emits intense shades of purple, green, lemon yellow, and crimson red up to 12 feet high.',
    price: 36000, // ₹360.00
    category: Category.FLOWERPOTS,
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
    stockQuantity: 60,
    isActive: true,
  },

  // ROCKETS
  {
    name: 'Sky Whistle Rockets (Pack of 10)',
    description: 'High velocity screamers that ascend with a loud siren screech and burst into a silver umbrella.',
    price: 32000, // ₹320.00
    category: Category.ROCKETS,
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    stockQuantity: 85,
    isActive: true,
  },
  {
    name: 'Parachute Sky Shot Rockets (Pack of 5)',
    description: 'Launches 80 feet into the night sky, releasing an illuminated glowing parachute gently floating down.',
    price: 45000, // ₹450.00
    category: Category.ROCKETS,
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80',
    stockQuantity: 40,
    isActive: true,
  },
  {
    name: 'Mega Galaxy Rockets 3-Stage (Pack of 3)',
    description: 'Triple burst heavy rockets with gold willow, ruby peony, and crackling brocade crown.',
    price: 59000, // ₹590.00
    category: Category.ROCKETS,
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    stockQuantity: 30,
    isActive: true,
  },

  // FOUNTAINS
  {
    name: 'Peacock 7-Color Fountain (Single Box)',
    description: 'Magnificent conic fountain imitating a strutting peacock fan with 7 shifting colors and low smoke.',
    price: 34000, // ₹340.00
    category: Category.FOUNTAINS,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
    stockQuantity: 50,
    isActive: true,
  },
  {
    name: 'Silver Cascade Niagara Waterfall (Single)',
    description: 'Massive silver sparks waterfall cascading continuous sparks for over 90 seconds.',
    price: 42000, // ₹420.00
    category: Category.FOUNTAINS,
    imageUrl: 'https://images.unsplash.com/photo-1533230307785-5fe068595eb2?w=600&q=80',
    stockQuantity: 45,
    isActive: true,
  },

  // BOMBS / SOUND CRACKERS
  {
    name: 'Classic 28 Chorsa Crackers (Pack of 5 strings)',
    description: 'Traditional rhythmic red paper firecrackers delivering classic Diwali festive sound and auspicious energy.',
    price: 19000, // ₹190.00
    category: Category.BOMBS,
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80',
    stockQuantity: 110,
    isActive: true,
  },
  {
    name: 'Hydro Green Sound King (Pack of 10)',
    description: 'Eco-certified green formula loud sound cracker compliant with low-emission standards.',
    price: 25000, // ₹250.00
    category: Category.BOMBS,
    imageUrl: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&q=80',
    stockQuantity: 95,
    isActive: true,
  },
  {
    name: 'Thunderbolt Mega Sound Shells (Pack of 5)',
    description: 'Heavy bass sonic boom crackers with intense reverberation. For open grounds only.',
    price: 38000, // ₹380.00
    category: Category.BOMBS,
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    stockQuantity: 0, // Test out-of-stock state!
    isActive: true,
  },

  // FANCY ITEMS
  {
    name: '12 Shots Aerial Multi-Color Cake',
    description: 'Rapid sequential battery shooting 12 colorful aerial comets bursting into chrysanthemums.',
    price: 75000, // ₹750.00
    category: Category.FANCY_ITEMS,
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80',
    stockQuantity: 40,
    isActive: true,
  },
  {
    name: '30 Shots Golden Willow Sky Spectacular',
    description: 'Professional grade mini display box. Shoots 30 golden weeping willow comets lighting the whole sky.',
    price: 165000, // ₹1,650.00
    category: Category.FANCY_ITEMS,
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    stockQuantity: 25,
    isActive: true,
  },
  {
    name: 'Spinning Butterfly Flying Saucer (Pack of 10)',
    description: 'Whirling spinners that lift off vertically spinning with bright green lights and a soft crackle.',
    price: 27000, // ₹270.00
    category: Category.FANCY_ITEMS,
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
    stockQuantity: 65,
    isActive: true,
  },

  // COMBO PACKS
  {
    name: 'Kids Safety Diwali Joy Hamper (18 Items)',
    description: 'Specially curated kid-friendly safe box containing sparklers, ground chakras, pencil fountains, and snake tablets.',
    price: 99900, // ₹999.00
    category: Category.COMBO_PACKS,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
    stockQuantity: 50,
    isActive: true,
  },
  {
    name: 'Family Celebration Grand Pack (35 Items)',
    description: 'Complete family package with a balanced mix of sparklers, chakkars, pots, whistling rockets, and aerial shots.',
    price: 249900, // ₹2,499.00
    category: Category.COMBO_PACKS,
    imageUrl: 'https://images.unsplash.com/photo-1533230307785-5fe068595eb2?w=600&q=80',
    stockQuantity: 35,
    isActive: true,
  },
  {
    name: 'Royal VIP Display Box (60 Premium Items)',
    description: 'Ultimate festival collection featuring 50-shot aerial cakes, giant waterfalls, tri-color flowerpots, and premium sparklers.',
    price: 499900, // ₹4,999.00
    category: Category.COMBO_PACKS,
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    stockQuantity: 20,
    isActive: true,
  },
]

async function main() {
  console.log('Seeding Diwali Kadai products...')

  // Upsert products so re-running seed doesn't duplicate
  for (const item of sampleProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    })

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: item,
      })
    } else {
      await prisma.product.create({
        data: item,
      })
    }
  }

  const count = await prisma.product.count()
  console.log(`✓ Seed completed successfully. Total products in database: ${count}`)
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
