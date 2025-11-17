import BookSearch from "@/components/BookSearch";
import { Book } from '@/types/Book'

export async function BookShowcase(): Promise<Book[]> {
  const res = await fetch(
    'https://www.googleapis.com/books/v1/volumes?q=intitle:bestseller&maxResults=12'
  )
  const data = await res.json()

  const books: Book[] =
    data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
    })) || []

  return books
}

export default async function Page() {
  // Server fetch of a small default set (title-only bestseller matches)
  const books = await BookShowcase()

  return (
    <main className="p-6">
{/* Search area */}
      <section id="search" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Search Books</h2>
        <BookSearch initialBooks={books} />
      </section>
    </main>
  );
}
