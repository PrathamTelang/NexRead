import { Book } from "@/types/Book";

export default function BookCard({ book, delay }: { book: Book; delay?: number }) {
  const style = { ...(delay ? ({ ['--delay' as any]: `${delay}ms` } as any) : undefined), overflow: 'hidden' };

  return (
    <div className="p-1 card cursor-pointer animate-card w-full h-auto rounded-lg bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 " style={style}>
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-auto object-cover"
        />
      ) : (
        <div className="w-full h-40 rounded-image skeleton" />
      )}

      <h2 className="mt-2 font-bold text-lg">{book.title}</h2>

      <p className="text-sm muted">{book.authors?.join(", ") || "Unknown Author"}</p>
    </div>
  );
}
