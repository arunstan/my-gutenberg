import { Book as DBBook } from "@prisma/client";
import { BookMetadata } from "./bookMetadata";

export type Book = DBBook & {
  title: string;
  author: string;
  metadata: BookMetadata;
};
