'use client'

import { Search, BookMarked, Sparkles } from './icons'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Find a book',
    description:
      'Search thousands of books from our library or discover something new.',
  },
  {
    number: '02',
    icon: BookMarked,
    title: 'Choose your format',
    description:
      'Generate summaries, deep dives, key takeaways, or chapter breakdowns.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Learn faster',
    description:
      'Read, listen, and understand the core ideas in minutes.',
  },
]

export function HowItWorks() {
  return (
    <section className="section py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Workflow
          </p>

          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            From book to understanding.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-500">
            NexRead transforms long books into clear, structured knowledge in
            three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="bg-background p-8 md:p-10"
              >
                <div className="mb-10 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                    <Icon className="h-5 w-5 text-zinc-300" />
                  </div>

                  <span className="text-sm font-medium text-zinc-600">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-zinc-100">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}