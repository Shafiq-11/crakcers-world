export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪔</span>
            <span className="font-semibold text-gray-900">Diwali Kadai</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Diwali Kadai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
