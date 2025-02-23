import React from "react";
import { BookAnalysis as BookAnalysisType } from "@/types/bookAnalysis";

type BookAnalysisProps = {
  analysisResult: BookAnalysisType | string | null;
  analysisError: string;
  analysisLoading: boolean;
  onReAnalyze: () => void;
  onClose: () => void;
  bookTitle: string;
  bookAuthor: string;
};

export default function BookAnalysis({
  analysisResult,
  analysisError,
  analysisLoading,
  onReAnalyze,
  onClose,
  bookTitle,
  bookAuthor,
}: BookAnalysisProps) {
  const renderAnalysis = () => {
    if (!analysisResult) return null;
    if (typeof analysisResult === "string") {
      return <pre className="whitespace-pre-wrap">{analysisResult}</pre>;
    }
    return (
      <div className="space-y-4">
        <div>
          <strong>Key Characters:</strong>{" "}
          {analysisResult.keyCharacters.join(", ")}
        </div>
        <div>
          <strong>Detected Language:</strong> {analysisResult.detectedLanguage}
        </div>
        <div>
          <strong>Sentiment:</strong> {analysisResult.sentiment}
        </div>
        <div>
          <strong>Reasoning for Sentiment:</strong>{" "}
          {analysisResult.sentimentReasoning}
        </div>
        <div>
          <strong>Plot Summary:</strong> {analysisResult.plotSummary}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-4xl w-[90vw] max-h-[80vh] overflow-y-auto">
          <div className="flex flex-row items-end mb-4">
            <div className="flex flex-row items-end">
              <h2 className="text-2xl font-bold mr-2">{bookTitle}</h2>
              <h3 className="text-lg">{bookAuthor}</h3>
            </div>
            <div className="ml-auto">
              <button
                onClick={onReAnalyze}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={analysisLoading}
              >
                {analysisLoading ? "Analyzing..." : "Refresh Analysis"}
              </button>
            </div>
          </div>
          {analysisError ? (
            <p className="text-red-500">{analysisError}</p>
          ) : (
            renderAnalysis()
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-0 right-[-40px] translate-x-1/2 -translate-y-1/2 text-6xl text-gray-100 hover:text-gray-50"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
