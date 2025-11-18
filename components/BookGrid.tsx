import Link from "next/link";
import BookCard from "./BookCard";
import { Book } from "@/types/Book";

export default function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
      {books.map((book, i) => (
        <Link key={book.id} href={`/book/${book.id}`}>
          <BookCard book={book} delay={i * 60} />
        </Link>
      ))}
    </div>
  );
}
