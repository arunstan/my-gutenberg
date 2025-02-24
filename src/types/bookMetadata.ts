export type BookMetadata = {
  id: number;
  title: string;
  authors: {
    name: string;
    birth_year: number;
    death_year: number;
  }[];
  formats: Record<string, string>;
  subjects: string[];
  copyright: boolean;
  languages: string[];
  summaries: string[];
  media_type: string;
  bookshelves: string[];
  translators: string[];
  download_count: number;
};
