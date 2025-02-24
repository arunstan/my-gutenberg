import { useState } from "react";
import { BookAnalysis } from "@/types/bookAnalysis";

export function useBookAnalysis(bookId?: string) {
  const [analysisResult, setAnalysisResult] = useState<
    BookAnalysis | string | null
  >(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const fetchAnalysis = async (forceRerun: boolean = false) => {
    if (!bookId) return;
    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const url = forceRerun
        ? `/api/book/${bookId}/analyze?rerun=true`
        : `/api/book/${bookId}/analyze`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to analyze book");
      }
      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      if (err instanceof Error) {
        setAnalysisError(err.message || "An error occurred during analysis");
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  return { analysisResult, analysisLoading, analysisError, fetchAnalysis };
}
