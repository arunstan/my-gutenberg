import { NextResponse } from "next/server";
import { Book, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { BookMetadata } from "@/types/bookMetadata";

const prisma = new PrismaClient();

const getBookFields = (metadata: BookMetadata) => {
  const title = metadata.title || "";
  const author = Array.isArray(metadata.authors)
    ? metadata.authors.map((a) => a.name)
    : [];
  return { title, author, metadata: metadata ?? {} };
};

const getBookContent = (text: string) => {
  const marker = "PROJECT GUTENBERG EBOOK";
  const firstIdx = text.indexOf(marker);
  const lastIdx = text.lastIndexOf(marker);

  if (firstIdx > -1 && lastIdx > -1) {
    const firstNewLineAfter = text.indexOf("\n", firstIdx);
    const lastNewLineBefore = text.lastIndexOf("\n", lastIdx);

    if (firstNewLineAfter > -1 && lastNewLineBefore > -1) {
      return text.slice(firstNewLineAfter + 1, lastNewLineBefore);
    }
  }

  return text;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
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
      const rawContent = (await contentResponse.text()).trim();

      // Clean the book content:
      const cleanedContent = getBookContent(rawContent);

      // Fetch metadata from Gutendex in JSON format
      const gutendexUrl = `https://gutendex.com/books?ids=${bookId}`;
      const gutendexResponse = await fetch(gutendexUrl);
      if (!gutendexResponse.ok)
        throw new Error("Failed to fetch metadata from Gutendex");
      const gutendexData = await gutendexResponse.json();

      const {
        title,
        author,
        metadata,
      }: Pick<Book, "title" | "author" | "metadata"> =
        gutendexData.results && gutendexData.results.length > 0
          ? getBookFields(gutendexData.results[0])
          : { title: null, author: [], metadata: {} };

      // Create a new Book record with the cleaned content
      book = await prisma.book.create({
        data: {
          id: bookId,
          content: cleanedContent,
          title,
          author,
          metadata,
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
