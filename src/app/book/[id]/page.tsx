"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (id) {
      async function fetchBook() {
        setLoading(true);
        try {
          const res = await fetch(`/api/book/${id}`);
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
      if (!loading) {
        fetchBook();
      }
    }
  }, [id, session, status]);

  const renderDataLoadStatus = () => {
    if (loading) {
      return <p>Loading book data...</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    if (!bookData) {
      return <p>No book data found.</p>;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        {bookData ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{bookData.title}</h1>
            <p>
              <strong>ID:</strong> {bookData.id}
            </p>
            <p>
              <strong>Authors:</strong>{" "}
              {Array.isArray(bookData.author)
                ? bookData.author.join(", ")
                : bookData.author}
            </p>
            <div className="mt-3">
              <h2 className="text-xl font-bold mb-1">Metadata</h2>
              {bookData.metadata && typeof bookData.metadata === "object" ? (
                <ul className="list-disc list-inside">
                  {Object.entries(bookData.metadata).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong>
                      {value !== null ? value?.toString() : "null"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{bookData.metadata}</p>
              )}
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-1">Content</h2>
              <div className="whitespace-pre-wrap">
                {bookData.content || "No content available."}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            {renderDataLoadStatus()}
          </div>
        )}
      </div>
    </div>
  );
}
