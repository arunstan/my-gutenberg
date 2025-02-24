"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./Button";
import { APP_TITLE } from "../constants";

export default function AppBar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center z-50 shadow-md relative">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <span className="text-2xl font-bold cursor-pointer">
              {APP_TITLE}
            </span>
          </Link>
          {/* Navigation links only visible on medium and up screens */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/">
              <span className="hover:underline cursor-pointer">Home</span>
            </Link>
            <Link href="/my-books">
              <span className="hover:underline cursor-pointer">My Books</span>
            </Link>
          </nav>
        </div>

        {/* Right side actions visible on medium and up screens */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <>
              <span>{session.user.email}</span>
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="primary"
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <span className="hover:underline cursor-pointer">Login</span>
            </Link>
          )}
        </div>

        {/* Hamburger menu: visible only on small screens */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile menu: visible on small screens when menuOpen is true */}
      {menuOpen && (
        <div className="md:hidden bg-blue-600 text-white p-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/">
              <span
                className="hover:underline cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </span>
            </Link>
            <Link href="/my-books">
              <span
                className="hover:underline cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                My Books
              </span>
            </Link>
          </nav>
          <div className="mt-2">
            {session?.user ? (
              <>
                <span className="mr-4">{session.user.email}</span>
                <Button
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    setMenuOpen(false);
                  }}
                  variant="primary"
                  size="sm"
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <span
                  className="hover:underline cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
