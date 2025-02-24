import React from "react";
import { BookAnalysis as BookAnalysisType } from "@/types/bookAnalysis";
import { Button } from "@/app/components/Button";
import Modal from "@/app/components/Modal";

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
    <Modal onClose={onClose}>
      <div className="flex flex-col sm:flex-row items-center mb-4">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">{bookTitle}</h2>
          <h3 className="text-base mb-2">
            <span className="font-bold">Authors:</span> {bookAuthor}
          </h3>
        </div>
        <div className="sm:ml-auto">
          <Button
            variant="ai"
            onClick={onReAnalyze}
            className="whitespace-nowrap"
            disabled={analysisLoading}
          >
            {analysisLoading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>
      </div>
      <div className="border-t pt-6 border-gray-300 dark:border-gray-600">
        {analysisError ? (
          <p className="text-red-500">{analysisError}</p>
        ) : (
          renderAnalysis()
        )}
      </div>
    </Modal>
  );
}
