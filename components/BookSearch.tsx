"use client";

import React, { useEffect, useState } from "react";
import BookGrid from "./BookGrid";
import { Book } from "@/types/Book";

export default function BookSearch({ initialBooks }: { initialBooks?: Book[] }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState<Book[]>(initialBooks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce user input to avoid firing requests on every keystroke
  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => window.clearTimeout(handler);
  }, [query]);

  // When debounced query changes, perform the search (unless empty)
  useEffect(() => {
    if (!debouncedQuery) {
      // If there's no query, show initial books (if any)
      setBooks(initialBooks || []);
      return;
    }
    search(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // If the parent updates `initialBooks` (e.g. after an async preload in Hero),
  // reflect that change in local state as long as there's no active search query.
  useEffect(() => {
    if (!debouncedQuery) {
      setBooks(initialBooks || []);
    }
  }, [initialBooks, debouncedQuery]);

  async function search(q: string) {
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      // Use server proxy to hide API key and centralize requests
      const res = await fetch(`/api/books?q=${encodeURIComponent(q)}&maxResults=20`);
      if (!res.ok) throw new Error(`Books proxy returned ${res.status}`);
      const data = await res.json();
      const items = data.items?.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      })) || [];
      setBooks(items);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // immediate search on submit (bypass debounce)
    setDebouncedQuery(query.trim());
  };

  return (
    <div >
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row justify-center gap-2 mb-4  sm:flex">
        <input
          id="book-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, authors, subjects..."
          className="px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder-gray-500 transition-all"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text)' }}
        />
        <button
          type="submit"
          className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="flex items-center gap-3 mb-4">
        {error && <p className="text-red-600">Error: {error}</p>}
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
      </div>

      <BookGrid books={books} />
    </div>
  );
}
