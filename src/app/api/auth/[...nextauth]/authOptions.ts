import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }
        // Look up the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          const { password: _password, ...rest } = user;
          return { ...rest, id: user.id.toString() };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url: _url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to home page after sign in
      return baseUrl;
    },
  },
};
