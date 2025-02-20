import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Get the current session from the request
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user in the database by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Query the UserBook records and include the related Book details
  const userBooks = await prisma.userBook.findMany({
    where: { userId: user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
        },
      },
    },
    orderBy: {
      accessedAt: "desc",
    },
  });

  // Map to just the book details
  const books = userBooks.map((ub) => ub.book);

  return NextResponse.json(books);
}
