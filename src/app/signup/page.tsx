"use client";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../components/Button";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/auth/signup", { email, password });
      if (res.status === 201) {
        // Optionally log the user in immediately after signing up.
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/",
        });
        if (result?.error) {
          setError("Signup succeeded but automatic login failed.");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow-md"
      >
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <Button type="submit" className="mt-2 w-full">
          Sign Up
        </Button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <Link href="/login">
          <span className="text-blue-500 hover:underline cursor-pointer">
            Login
          </span>
        </Link>
      </p>
    </div>
  );
}
