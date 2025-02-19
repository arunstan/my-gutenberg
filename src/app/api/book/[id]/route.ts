import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
  }

  try {
    // Check if the book is already in the database
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });
    if (existingBook) {
      return NextResponse.json(existingBook);
    }

    // Fetch the book text from Project Gutenberg
    const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const contentResponse = await fetch(contentUrl);
    if (!contentResponse.ok) throw new Error("Failed to fetch book content");
    const content = await contentResponse.text();

    // Fetch metadata from Gutendex in JSON format
    const gutendexUrl = `https://gutendex.com/books?ids=${bookId}`;
    const gutendexResponse = await fetch(gutendexUrl);
    if (!gutendexResponse.ok)
      throw new Error("Failed to fetch metadata from Gutendex");
    const gutendexData = await gutendexResponse.json();

    let title = "";
    let author: string[] = [];
    let parsedMetadata = {};

    if (gutendexData.results && gutendexData.results.length > 0) {
      parsedMetadata = gutendexData.results[0];
      title = parsedMetadata.title || "";
      // Map over the authors array from Gutendex to extract each author's name
      author = Array.isArray(parsedMetadata.authors)
        ? parsedMetadata.authors.map((a: any) => a.name)
        : [];
    }

    // Create a new book record including title and author array
    const newBook = await prisma.book.create({
      data: {
        id: bookId,
        content,
        metadata: parsedMetadata,
        title: title,
        author: author,
      },
    });

    return NextResponse.json(newBook);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch and store book data" },
      { status: 500 }
    );
  }
}
