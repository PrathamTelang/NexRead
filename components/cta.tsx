 'use client'

import { ArrowRight } from './icons'

export function CTA() {
  const scrollToSearch = () => {
    const el = document.getElementById('book-search-input') as HTMLInputElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.focus()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
          Start Summarizing Now
        </h2>
        <p className="text-lg text-gray-300 mb-12 max-w-xl mx-auto">
          Join thousands of readers who are learning smarter and faster with AI-powered book summaries.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={scrollToSearch} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2">
            Explore Books
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-lg font-semibold text-white transition-all">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
