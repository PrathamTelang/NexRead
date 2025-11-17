'use client'

import { BookOpen, Zap, Shield, Users } from './icons'

const features = [
  {
    icon: BookOpen,
    title: 'Pick From Thousands of Books',
    description: 'Access our vast library of books across all genres and categories.',
  },
  {
    icon: Zap,
    title: 'Generate Short, Medium, or Long Summaries',
    description: 'Choose exactly how much detail you need in seconds.',
  },
  {
    icon: Shield,
    title: 'Powered by Gemini AI (Free)',
    description: 'Advanced AI technology with zero subscription fees.',
  },
  {
    icon: Users,
    title: 'No Login. No Limits.',
    description: 'Start summarizing instantly without creating an account.',
  },
]

export function Features() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Why Choose NexRead?</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to summarize books and learn faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
