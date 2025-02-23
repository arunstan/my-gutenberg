import { useState, useEffect } from "react";

export function useBookDetails(bookId?: string) {
  const [bookData, setBookData] = useState<any>(null);
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
        setBookData(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  return { bookData, loading, error };
}
