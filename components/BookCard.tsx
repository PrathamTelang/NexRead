import { Book } from "@/types/Book";

export default function BookCard({
  book,
  delay,
}: {
  book: Book;
  delay?: number;
}) {
  const style = {
    ...(delay
      ? ({ ["--delay" as any]: `${delay}ms` } as any)
      : undefined),
  };

  return (
    <div
      className="
        group
        animate-card
        overflow-hidden
        rounded-lg
        border
        border-zinc-800
        bg-zinc-900/30
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-700
        hover:bg-zinc-900/60
      "
      style={style}
    >
      <div className="aspect-[3/4] overflow-hidden bg-zinc-950">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div className="h-full w-full bg-zinc-900" />
        )}
      </div>

      <div className="p-4">
        <h2
          className="
            line-clamp-2
            text-sm
            font-medium
            leading-snug
            text-zinc-100
          "
        >
          {book.title}
        </h2>

        <p
          className="
            mt-2
            line-clamp-1
            text-xs
            text-zinc-500
          "
        >
          {book.authors?.join(", ") || "Unknown Author"}
        </p>
      </div>
    </div>
  );
}