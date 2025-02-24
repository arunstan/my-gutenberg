import { useState } from "react";

export type ReadMoreTextBlockProps = {
  text?: string | null;
  previewLength?: number;
};

export const ReadMoreTextBlock = ({
  text,
  previewLength = 100,
}: ReadMoreTextBlockProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((prev) => !prev);

  if (text && text.length <= previewLength) {
    return <span>{text}</span>;
  }

  return text ? (
    <div>
      {expanded ? text : text.substring(0, previewLength) + "..."}
      <button
        onClick={toggleExpanded}
        className="ml-2 text-blue-500 hover:underline"
      >
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  ) : null;
};
