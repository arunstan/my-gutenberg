import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Ensure dynamic route params are awaited
  const { id } = await Promise.resolve(params);
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
  }

  // Get session to identify the authenticated user
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the user by their email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Check if the book already exists
    let book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      // Fetch the book text from Project Gutenberg
      const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
      const contentResponse = await fetch(contentUrl);
      if (!contentResponse.ok) throw new Error("Failed to fetch book content");
      const rawContent = await contentResponse.text();

      // Clean the book content:
      // Split into lines and extract the content between the start and end markers.
      const lines = rawContent.split("\n");
      let startIndex = -1;
      let endIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("PROJECT GUTENBERG EBOOK")) {
          startIndex = i;
          break;
        }
      }
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes("PROJECT GUTENBERG EBOOK")) {
          endIndex = i;
          break;
        }
      }
      let cleanedContent = rawContent.trim();
      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        // Start extraction from the line immediately after the start marker
        cleanedContent = lines
          .slice(startIndex + 1, endIndex)
          .join("\n")
          .trim();
      }

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

      // Create a new Book record with the cleaned content
      book = await prisma.book.create({
        data: {
          id: bookId,
          content: cleanedContent,
          metadata: parsedMetadata,
          title,
          author,
        },
      });
    }

    // Update or insert a UserBook record for the current user,
    // setting "accessedAt" to the current time.
    await prisma.userBook.upsert({
      where: {
        // Using the composite unique key (userId, bookId)
        userId_bookId: { userId: user.id, bookId },
      },
      update: {
        accessedAt: new Date(),
      },
      create: {
        userId: user.id,
        bookId,
        accessedAt: new Date(),
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch and store book data" },
      { status: 500 }
    );
  }
}
