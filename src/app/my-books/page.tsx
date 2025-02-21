"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session) {
      fetchBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/book/list");
      if (!res.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await res.json();
      setBooks(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">My Books</h1>
        {loading ? (
          <p>Loading books...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : books.length > 0 ? (
          <ul>
            {books.map((book) => (
              <li key={book.id} className="border-b py-2">
                <Link
                  href={`/book/${book.id}`}
                  className="text-blue-500 hover:underline"
                >
                  <h2 className="text-xl font-semibold">{book.title}</h2>
                </Link>
                <p>
                  <strong>ID:</strong> {book.id}
                </p>
                <p>
                  <strong>Author:</strong>{" "}
                  {Array.isArray(book.author)
                    ? book.author.join(", ")
                    : book.author}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No books accessed yet.</p>
        )}
      </div>
    </div>
  );
}
