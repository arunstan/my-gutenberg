import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
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

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.analysis && rerun !== "true") {
      return NextResponse.json({ analysis: book.analysis });
    }

    const prompt = generatePrompt(book.content);

    // Generate analysis using Vercel's AI SDK for Groq.
    const { text } = await generateText({
      model: groq("gemma2-9b-it"),
      prompt,
      temperature: 0.7,
    });

    // Remove the markdown code block markers ("```json" and "```") from the response.
    let cleanedText = text;
    if (typeof cleanedText === "string") {
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/i, "");
    }

    let formattedAnalysis;
    try {
      formattedAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse LLM response as JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse analysis response. Please try again." },
        { status: 500 }
      );
    }

    // Validate that the formatted analysis has the expected keys.
    const expectedKeys = [
      "key_characters",
      "detected_language",
      "sentiment",
      "reasoning_for_sentiment",
      "plot_summary",
    ];
    const hasAllKeys = expectedKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(formattedAnalysis, key)
    );
    if (!hasAllKeys) {
      console.error(
        "Formatted analysis is missing expected keys:",
        formattedAnalysis
      );
      return NextResponse.json(
        { error: "Formatted analysis is missing expected keys." },
        { status: 500 }
      );
    }

    // Save or update the analysis in the database.
    await prisma.book.update({
      where: { id: bookId },
      data: { analysis: formattedAnalysis },
    });

    return NextResponse.json({ analysis: formattedAnalysis });
  } catch (error: any) {
    console.error("Error analyzing book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function generatePrompt(bookText: string): string {
  const sampleText = bookText.slice(0, 10000);
  return `
You are a text analysis assistant. Given the book text sample below, please provide the following analyses in a valid JSON format:
{
  "key_characters": [ "Name1", "Name2", ... ],
  "detected_language": "Language",
  "sentiment": "Positive/Negative/Neutral",
  "reasoning_for_sentiment": "Brief reasoning here",
  "plot_summary": "A brief plot summary..."
}

Book Text Sample:
${sampleText}

Please ensure the JSON is properly formatted. Do not send any additional data outside the JSON structure. Do not send the JSON code markers.
  `;
}
