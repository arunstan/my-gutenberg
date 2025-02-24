import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { groq } from "@ai-sdk/groq";
import { generateObject, jsonSchema } from "ai";
import { BookAnalysis } from "@/types/bookAnalysis";
import { type NextRequest } from "next/server";

const prisma = new PrismaClient();

// The number of characters that should be send to LLM for processing
// Keeping this as per model limits
const BOOK_TEXT_LIMIT = 15000;

const bookAnalysisSchema = jsonSchema<BookAnalysis>({
  type: "object",
  properties: {
    keyCharacters: {
      type: "array",
      items: { type: "string" },
    },
    detectedLanguage: { type: "string" },
    sentiment: { type: "string" },
    sentimentReasoning: { type: "string" },
    plotSummary: { type: "string" },
  },
  required: [
    "keyCharacters",
    "detectedLanguage",
    "sentiment",
    "sentimentReasoning",
    "plotSummary",
  ],
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const searchParams = request.nextUrl.searchParams;
    const rerun = searchParams.get("rerun");

    if (!id) {
      return NextResponse.json(
        { error: "Book id is required" },
        { status: 400 }
      );
    }
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.analysis && rerun !== "true") {
      return NextResponse.json({ analysis: book.analysis });
    }

    const prompt = generatePrompt(book.content);

    // Use generateObject to directly obtain a structured analysis.
    const { object: formattedAnalysis } = await generateObject<BookAnalysis>({
      model: groq("gemma2-9b-it"),
      prompt,
      temperature: 0.7,
      schema: bookAnalysisSchema,
    });

    // Save or update the analysis in the database.
    await prisma.book.update({
      where: { id: bookId },
      data: { analysis: formattedAnalysis },
    });

    return NextResponse.json({ analysis: formattedAnalysis });
  } catch (error) {
    console.error("Error analyzing book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function generatePrompt(bookText: string): string {
  const sampleText = bookText.slice(0, BOOK_TEXT_LIMIT);
  return `
You are a text analysis assistant. Given the book text sample below, please provide the following analyses in a valid JSON format:
{
  "keyCharacters": "<string array of key characters>",
  "detectedLanguage": "Language",
  "sentiment": "Positive/Negative/Neutral",
  "sentimentReasoning": "Brief reasoning here",
  "plotSummary": "A brief plot summary..."
}

Book Text Sample:
${sampleText}

Please ensure the JSON is properly formatted. Do not send any additional data outside the JSON structure. Do not send the JSON code markers.
  `;
}
