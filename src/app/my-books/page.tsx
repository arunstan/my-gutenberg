"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Book } from "@prisma/client";
import { Button } from "../components/Button";

const cardStyle = {
  backgroundColor: "rgb(182,86,0)",
  background:
    "linear-gradient(180deg, rgba(182,86,0,1) 0%, rgba(126,46,0,1) 100%)",
};

const titleStyle = {
  fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
};

export default function MyBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Toggle state: true = Card View, false = List View
  const [isCardView, setIsCardView] = useState(true);

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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch books");
      }
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
        <div className="flex flex-col sm:flex-row mb-2">
          <h1 className="text-2xl font-bold mb-4">My Books</h1>
          <div className="flex sm:ml-auto mb-4">
            <Button
              onClick={() => setIsCardView(!isCardView)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              {isCardView ? "Switch to List View" : "Switch to Card View"}
            </Button>
          </div>
        </div>
        {loading ? (
          <p>Loading books...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : books.length > 0 ? (
          isCardView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="h-full"
                >
                  <div
                    style={cardStyle}
                    className="border hover:border-[#D07631] border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition duration-300 h-full flex flex-col min-h-[300px]"
                  >
                    <div className="p-4 pt-6 pb-6 flex items-center justify-center flex-col h-full">
                      <h2
                        style={titleStyle}
                        className="text-2xl font-semibold text-center"
                      >
                        {book.title}
                      </h2>
                      <p className="mt-auto text-center">{book.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
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
                    <strong>Author:</strong> {book.author}
                  </p>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p>No books accessed yet.</p>
        )}
      </div>
    </div>
  );
}
