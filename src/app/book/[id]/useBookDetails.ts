import { Book } from "@/types/book";
import { useState, useEffect } from "react";

export function useBookDetails(bookId?: string) {
  const [bookData, setBookData] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookId) return;
    async function fetchBook() {
      setLoading(true);
      try {
        const res = await fetch(`/api/book/${bookId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch book data");
        }
        const data = await res.json();

        const author = data
          ? Array.isArray(data.author)
            ? data.author.join(", ")
            : data.author
          : "";

        const title = data?.title ?? "";
        const cleanedData = { ...data, author, title };

        setBookData(cleanedData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  return { bookData, loading, error };
}
