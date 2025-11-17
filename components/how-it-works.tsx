'use client'

import { Search, BookMarked, Sparkles } from './icons'

const steps = [
  {
    number: 1,
    icon: Search,
    title: 'Browse or Search',
    description: 'Find any book from our vast library.',
  },
  {
    number: 2,
    icon: BookMarked,
    title: 'Select Your Book',
    description: 'Click to choose the book you want to summarize.',
  },
  {
    number: 3,
    icon: Sparkles,
    title: 'Get Instant Summary',
    description: 'Choose length and get your AI summary instantly.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-l from-purple-500/5 via-transparent to-blue-500/5" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">How It Works</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Three simple steps to get your perfect book summary.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="text-center">
                {/* Step Circle */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-semibold mb-2">
                  {step.title}
                  <div className="text-sm text-gray-500 font-normal">Step {step.number}</div>
                </h3>

                {/* Step Description */}
                <p className="text-gray-400">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
