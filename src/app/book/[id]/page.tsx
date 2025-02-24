"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BookContent from "./BookContent";
import BookAnalysis from "./BookAnalysis";
import BookMetadata from "./BookMetadata";
import { useBookDetails } from "./useBookDetails";
import { useBookAnalysis } from "./useBookAnalysis";
import { Button } from "@/app/components/Button";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const { bookData, loading, error } = useBookDetails(id as string);

  const { analysisResult, analysisLoading, analysisError, fetchAnalysis } =
    useBookAnalysis(id as string);

  const [showContentModal, setShowContentModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Redirect to login if session is not available.
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [status, session, router]);

  const renderDataLoadStatus = () => {
    if (loading) return <p>Loading book data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!bookData) return <p>No book data found.</p>;
  };

  const handleClickReadBook = () => {
    setShowContentModal(true);
  };

  const handleClickAnalyze = async () => {
    await fetchAnalysis();
    setShowAnalysisModal(true);
  };

  const handleClickReAnalyze = () => {
    fetchAnalysis(true);
  };

  const handleClickContentModal = () => setShowContentModal(false);
  const handleClickAnalysisModal = () => setShowAnalysisModal(false);

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
              <strong>Authors:</strong>
              {bookData.author}
            </p>
            <div className="mt-4 flex gap-4">
              <Button onClick={handleClickReadBook} variant="primary">
                Read Book
              </Button>
              <Button
                onClick={handleClickAnalyze}
                variant="ai"
                disabled={analysisLoading}
              >
                {analysisLoading ? "Analyzing..." : "AI Analyze"}
              </Button>
            </div>
            <div className="mt-4">
              <BookMetadata metadata={bookData.metadata} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            {renderDataLoadStatus()}
          </div>
        )}
      </div>

      {showContentModal && bookData && (
        <BookContent
          content={bookData.content}
          onClose={handleClickContentModal}
        />
      )}

      {showAnalysisModal && bookData && (
        <BookAnalysis
          analysisResult={analysisResult}
          analysisError={analysisError}
          analysisLoading={analysisLoading}
          onReAnalyze={handleClickReAnalyze}
          onClose={handleClickAnalysisModal}
          bookTitle={bookData.title}
          bookAuthor={bookData.author}
        />
      )}
    </div>
  );
}
