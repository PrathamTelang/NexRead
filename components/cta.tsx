'use client'

import { ArrowRight } from './icons'

export function CTA() {
  const scrollToSearch = () => {
    const el = document.getElementById('book-search-input') as HTMLInputElement | null

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      el.focus()
    }
  }

  return (
    <section className="section py-24">
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-950
        "
      >
        <div className="mx-auto max-w-3xl px-8 py-20 text-center md:px-16">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Get Started
          </p>

          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            Start reading smarter.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500">
            Search a book, generate a summary, and understand the key ideas
            in minutes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToSearch}
              className="
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                bg-white
                px-5
                text-sm
                font-medium
                text-black
                transition-opacity
                hover:opacity-90
              "
            >
              Search Books
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              className="
                inline-flex
                h-11
                items-center
                rounded-xl
                border
                border-zinc-800
                px-5
                text-sm
                text-zinc-300
                transition-colors
                hover:bg-zinc-900
              "
            >
              Browse Library
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}