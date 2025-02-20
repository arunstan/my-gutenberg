"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookId, setBookId] = useState("");

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return <p>Loading...</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookId.trim() !== "") {
      // Navigate to the dedicated book view page
      router.push(`/book/${bookId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Find a book
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
            Fetch Book
          </button>
        </form>
      </div>
    </div>
  );
}
