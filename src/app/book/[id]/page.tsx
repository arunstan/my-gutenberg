"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ReadMoreTextBlock } from "@/app/components/ReadMoreTextBlock";

const IGNORED_METADATA_FIELDS = [
  "id",
  "title",
  "authors",
  "summaries",
  "formats",
  "translators",
];

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const transformMetadataKey = (key: string) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const transformMetadataValue = (value?: unknown) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        return value.join(", ");
      } else {
        return JSON.stringify(value);
      }
    } else {
      return null;
    }
  };

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
            <div className="mt-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Read Book
              </button>
            </div>
            <div className="mt-4">
              {bookData.metadata.summaries && (
                <div className="flex flex-col rounded mt-2 mb-4">
                  <span className="font-bold">Summary</span>
                  <span>
                    <ReadMoreTextBlock
                      text={transformMetadataValue(bookData.metadata.summaries)}
                    />
                  </span>
                </div>
              )}
              {bookData.metadata && typeof bookData.metadata === "object" ? (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "300px 300px" }}
                >
                  {Object.entries(bookData.metadata)
                    .filter(([key]) => !IGNORED_METADATA_FIELDS.includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col rounded">
                        <span className="font-bold">
                          {transformMetadataKey(key)}
                        </span>
                        <span>{transformMetadataValue(value)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p>{bookData.metadata}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            {renderDataLoadStatus()}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-6xl w-[90vw] max-h-[80vh] overflow-y-auto">
              <div className="whitespace-pre-wrap">
                {bookData?.content || "No content available."}
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-0 right-[-40] translate-x-1/2 -translate-y-1/2 text-6xl text-gray-100 hover:text-gray-50"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
