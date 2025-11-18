 'use client'

import React, { useEffect, useState } from 'react'
import { Search, Sparkles } from './icons'
import { useRouter } from 'next/navigation'
import BookSearch from './BookSearch'
import { Book } from '@/types/Book'

export function Hero() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function loadBooks() {
      try {
        const res = await fetch(
          'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=16'
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
        // swallow or handle fetch errors here
        console.error('Failed to load books', err)
      }
    }

    loadBooks()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 w-screen mx-auto text-center">
        {/* Tagline */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-200">Powered by Gemini AI</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
          AI Summaries for Any Book
          <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
          Choose any book and generate 5, 10, or 20+ page summaries using advanced AI.
          No login. No limits. Start reading less, understanding more.
        </p>

        {/* Search Bar */}
        <div>
          <BookSearch initialBooks={books} />
        </div>

      </div>
    </section>
  )
}
