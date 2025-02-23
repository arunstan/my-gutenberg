"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./components/Button";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookId, setBookId] = useState("");
  const [error, setError] = useState("");

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
    if (!error) {
      router.push(`/book/${bookId}`);
    }
  };

  const handleChangeBookId = (e: ChangeEvent<HTMLInputElement>) => {
    setBookId(e.target.value);
    const id = Number(e.target.value);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a number greater than 0.");
      return;
    }
    setError(""); // clear any existing error
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Find a book
        </h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-row">
            <input
              id="bookId"
              value={bookId}
              onChange={handleChangeBookId}
              placeholder="Enter a book ID, e.g. 1"
              className="w-4/5 border border-gray-300 dark:border-gray-600 rounded p-2 mr-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button
              type="submit"
              variant="primary"
              className="w-1/5"
              disabled={!!error}
            >
              Fetch Book
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
