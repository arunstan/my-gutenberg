import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // Validate the id
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid book id" });
  }

  const bookId = parseInt(id as string, 10);

  try {
    // Check if the book already exists in the database
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (existingBook) {
      return res.status(200).json(existingBook);
    }

    // Fetch the book content from Project Gutenberg
    const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const contentResponse = await fetch(contentUrl);
    if (!contentResponse.ok) {
      throw new Error("Failed to fetch book content");
    }
    const content = await contentResponse.text();

    // Fetch the metadata (HTML from the book's page)
    const metadataUrl = `https://www.gutenberg.org/ebooks/${bookId}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch book metadata");
    }
    const metadataHtml = await metadataResponse.text();

    // Store the metadata HTML inside a JSON object so it matches the Prisma JSON field
    const metadata = { html: metadataHtml };

    // Create a new book record in the database
    const newBook = await prisma.book.create({
      data: {
        id: bookId,
        content,
        metadata,
        // Optionally, you could parse and store title, author, etc. if available.
      },
    });

    res.status(200).json(newBook);
  } catch (error) {
    console.error("Error processing /api/book/[id]:", error);
    res.status(500).json({ error: "Failed to fetch and store book data" });
  }
};

export default handler;
