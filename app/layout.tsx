import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Diwali Kadai | Premium Diwali Crackers & Fireworks',
  description:
    'Shop premium Diwali crackers and fireworks online. Sparklers, rockets, flowerpots, chakras, combo packs and more. Safe delivery to your doorstep.',
  keywords: ['diwali crackers', 'fireworks', 'sparklers', 'rockets', 'diwali shopping', 'online crackers'],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
