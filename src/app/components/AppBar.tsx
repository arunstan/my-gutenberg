"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { APP_TITLE } from "../layout";

export default function AppBar() {
  const { data: session } = useSession();

  return session ? (
    <header className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center z-50 shadow-md">
      <div className="flex items-center space-x-6">
        <Link href="/">
          <span className="text-2xl font-bold cursor-pointer">{APP_TITLE}</span>
        </Link>
        <nav className="flex space-x-4">
          <Link href="/">
            <span className="hover:underline cursor-pointer">Home</span>
          </Link>
          <Link href="/my-books">
            <span className="hover:underline cursor-pointer">My Books</span>
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <>
            <span>{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">
            <span className="hover:underline cursor-pointer">Login</span>
          </Link>
        )}
      </div>
    </header>
  ) : null;
}
