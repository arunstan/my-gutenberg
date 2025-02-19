"use client";
import { useState } from "react";

export default function Home() {
  const [bookId, setBookId] = useState("");
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBookData(null);

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
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Gutenberg Book Fetcher
        </h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <label
            htmlFor="bookId"
            className="block text-gray-700 dark:text-gray-300 mb-2"
          >
            Enter Book ID:
          </label>
          <input
            id="bookId"
            type="text"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            placeholder="e.g. 1"
            className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? "Loading..." : "Fetch Book"}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {bookData && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Book Data:
            </h2>
            <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded text-sm overflow-auto text-gray-900 dark:text-gray-100">
              {JSON.stringify(bookData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
