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
  <div className="mt-10">
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <input
          id="book-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, authors, subjects..."
          className="
            h-12
            w-full
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/40
            px-4
            text-sm
            text-zinc-100
            placeholder:text-zinc-500
            outline-none
            transition-colors
            focus:border-zinc-700
          "
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          h-12
          rounded-xl
          bg-gray-100
          cursor-pointer
          px-10
          text-sm
          font-medium
          text-black
          transition-opacity
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>

    <div className="mx-auto mt-4 flex max-w-2xl items-center">
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-zinc-500"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
    </div>

    <BookGrid books={books} />
  </div>
);
}
