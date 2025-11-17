'use client'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 px-4 border-t border-gray-800 bg-gradient-to-b from-transparent to-gray-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SG</span>
            </div>
            <span className="text-lg font-semibold">SummaryGenie</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center md:text-right">
            © {currentYear} SummaryGenie. All rights reserved.
          </p>
        </div>

        {/* Bottom divider */}
        <div className="mt-8 pt-8 border-t border-gray-800/50">
          <p className="text-center text-xs text-gray-600">
            Powered by Gemini AI • Read smarter, understand faster
          </p>
        </div>
      </div>
    </footer>
  )
}
