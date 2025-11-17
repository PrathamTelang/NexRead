import { NextResponse } from "next/server";

// Simple in-memory cache for proxied Google Books responses.
// Keyed by `q|maxResults`. TTL is configurable below.
const cache = new Map<string, { ts: number; body: any }>();
const TTL_MS = 1000 * 60 * 2; // 2 minutes

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const max = url.searchParams.get("maxResults") || "20";

  // Dev diagnostics: log incoming queries so we can trace failing requests
  try {
    console.log(`app/api/books: incoming request q="${q}" max=${max}`);
  } catch (e) {
    // ignore logging failures in constrained runtimes
  }
  const cacheKey = `${q}|${max}`;
  const now = Date.now();

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    // If no Google Books API key is available, fall back to Open Library (no key required).
    // This keeps the search UX working for local development without requiring an API key.
    console.warn("app/api/books: GOOGLE_BOOKS_API_KEY not set — falling back to Open Library");
    const olTarget = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      q
    )}&limit=${encodeURIComponent(max)}`;
    try {
      const olRes = await fetch(olTarget);
      const olJson = await olRes.json();
      const items = (olJson.docs || []).map((doc: any) => {
        // Open Library `doc.key` is like "/works/OL1063267W" or "/books/OL123M".
        // Normalize to a single path segment so our app route `/book/[id]`
        // matches correctly. Prefer the ID part after the last slash.
        const rawKey: string = doc.key || "";
        const normalizedId = rawKey.replace(/^\/+/, "").split("/").pop() || rawKey.replace(/^\/+/, "");

        return {
          id: normalizedId,
          volumeInfo: {
            title: doc.title,
            authors: doc.author_name,
            imageLinks: doc.cover_i
              ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` }
              : undefined,
          },
        };
      });
      const body = { kind: "books#volumes", totalItems: olJson.numFound || items.length, items };
      // cache the fallback response as well
      if (olRes.ok) cache.set(cacheKey, { ts: now, body });
      return NextResponse.json(body, { status: olRes.status });
    } catch (err: any) {
      console.error("app/api/books: Open Library fallback failed", err);
      return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
  }

  const cached = cache.get(cacheKey);
  if (cached && now - cached.ts < TTL_MS) {
    return NextResponse.json(cached.body);
  }

  const target = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    q
  )}&maxResults=${encodeURIComponent(max)}&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(target);
    const text = await res.text();
    try {
      const body = JSON.parse(text);
      // cache success responses
      if (res.ok) cache.set(cacheKey, { ts: now, body });
      return NextResponse.json(body, { status: res.status });
    } catch {
      return NextResponse.json({ raw: text }, { status: res.status });
    }
  } catch (err: any) {
    console.error("app/api/books: fetch error", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
