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
    // Check if the book already exists in the database
    let book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
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
        // Extract author names from the authors array
        author = Array.isArray(parsedMetadata.authors)
          ? parsedMetadata.authors.map((a: any) => a.name)
          : [];
      }

      // Create a new Book record
      book = await prisma.book.create({
        data: {
          id: bookId,
          content,
          metadata: parsedMetadata,
          title,
          author,
        },
      });

      // Create a new UserBook record for user with id 1
      await prisma.userBook.create({
        data: {
          userId: 1,
          bookId: book.id,
        },
      });
    } else {
      // Book already exists; update (or insert) a UserBook record for user 1
      await prisma.userBook.upsert({
        where: {
          // Use the composite unique key (userId, bookId)
          userId_bookId: { userId: 1, bookId },
        },
        update: {
          accessedAt: new Date(),
        },
        create: {
          userId: 1,
          bookId,
        },
      });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch and store book data" },
      { status: 500 }
    );
  }
}
