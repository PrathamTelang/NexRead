'use client'

import React, { useEffect, useState } from 'react'
import BookSearch from './BookSearch'
import { Book } from '@/types/Book'
import { Sparkles } from 'lucide-react'

export function Hero() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    let mounted = true

    async function loadBooks() {
      try {
        const res = await fetch(
  "/api/books?q=subject:fiction&maxResults=12"
)

        const data = await res.json()

        const items =
          data.items?.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail,
          })) || []

        if (mounted) setBooks(items)
      } catch (err) {
        console.error(err)
      }
    }

    loadBooks()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 grid-border opacity-40" />

      {/* Glow */}
      <div className="absolute inset-0 hero-gradient" />

      <div className="section relative z-10">
        <div className="mx-auto mt-10 flex min-h-[85vh] max-w-4xl flex-col items-center justify-center text-center">
          
          {/* Badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
  The fastest way
  <br />
  to understand any book.
</h1>

<p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500 md:text-lg">
  Summaries, insights, and audio explanations powered by AI. Learn the core ideas without spending hours reading.
</p>

          {/* Search */}
          <div className="mt-12 w-full max-w-3xl">
            <BookSearch initialBooks={books} />
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
            <span>10,000+ books</span>
            <span>•</span>
            <span>No login required</span>
            <span>•</span>
            <span>Free forever</span>
          </div>
        </div>
      </div>
    </section>
  )
}