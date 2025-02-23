"use client";

import React from "react";
import { ReadMoreTextBlock } from "@/app/components/ReadMoreTextBlock";

export type BookMetadataProps = {
  metadata: any;
  ignoredFields?: string[];
};

const defaultIgnoredFields = [
  "id",
  "title",
  "authors",
  "formats",
  "translators",
  "summaries",
];

export function transformMetadataKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function transformMetadataValue(value?: unknown): string | null {
  if (value !== null && value !== undefined) {
    if (Array.isArray(value)) {
      return value.join(", ");
    } else {
      return typeof value === "string" ? value : JSON.stringify(value);
    }
  }
  return null;
}

const BookMetadata: React.FC<BookMetadataProps> = ({
  metadata,
  ignoredFields = defaultIgnoredFields,
}) => {
  if (!metadata) return null;

  return (
    <div>
      {metadata.summaries && (
        <div className="mb-4">
          <h3 className="font-bold">Summary</h3>
          <ReadMoreTextBlock
            text={transformMetadataValue(metadata.summaries)}
          />
        </div>
      )}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "300px 300px" }}
      >
        {Object.entries(metadata)
          .filter(([key]) => !ignoredFields.includes(key))
          .map(([key, value]) => (
            <div key={key} className="flex flex-col rounded">
              <span className="font-bold">{transformMetadataKey(key)}</span>
              <span>{transformMetadataValue(value)}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BookMetadata;
