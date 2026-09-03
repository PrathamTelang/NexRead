'use client'

import { BookOpen, Zap, Shield, Users } from './icons'

const features = [
  {
    icon: BookOpen,
    title: 'Large Book Library',
    description:
      'Search and explore thousands of books across categories and genres.',
  },
  {
    icon: Zap,
    title: 'Multiple Reading Modes',
    description:
      'Generate summaries, deep dives, key insights, and chapter breakdowns.',
  },
  {
    icon: Shield,
    title: 'Powered by Gemini',
    description:
      'Fast, reliable AI-generated insights with no subscriptions required.',
  },
  {
    icon: Users,
    title: 'No Account Required',
    description:
      'Search, summarize, and learn instantly without creating an account.',
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="section py-24"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Features
          </p>

          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            Everything you need to learn faster.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-500">
            Built for readers who want to understand more in less time.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="
                  group
                  bg-background
                  p-8
                  transition-colors
                  hover:bg-zinc-950/50
                "
              >
                <div
                  className="
                    mb-6
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-zinc-800
                    bg-zinc-900
                  "
                >
                  <Icon className="h-5 w-5 text-zinc-300" />
                </div>

                <h3 className="text-lg font-medium text-zinc-100">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}