"use client";
import { useState } from "react";

export default function Home() {
  const [bookId, setBookId] = useState("");
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6">
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded text-gray-900 dark:text-gray-100">
              <h3 className="text-2xl font-semibold mb-2">{bookData.title}</h3>
              <p className="mb-1">
                <strong>ID:</strong> {bookData.id}
              </p>
              <p className="mb-1">
                <strong>Authors:</strong>{" "}
                {Array.isArray(bookData.authors)
                  ? bookData.authors.join(", ")
                  : bookData.authors}
              </p>
              <div className="mt-3">
                <h4 className="text-lg font-bold mb-1">Metadata</h4>
                {bookData.metadata && typeof bookData.metadata === "object" ? (
                  <ul className="list-disc list-inside">
                    {Object.entries(bookData.metadata).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value.toString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{bookData.metadata}</p>
                )}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Read Book
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center">
          <button
            onClick={() => setIsModalOpen(false)}
            className="fixed top-4 right-4 text-4xl font-bold text-white hover:text-gray-300"
          >
            &times;
          </button>
          <div className="bg-white dark:bg-gray-800 p-6 rounded  mt-6 max-w-6xl mx-4 max-h-full overflow-auto">
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {bookData.content || "No content available."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
