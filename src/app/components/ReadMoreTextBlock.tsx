import { useState } from "react";

export const ReadMoreTextBlock = ({ text, previewLength = 100 }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((prev) => !prev);

  if (text.length <= previewLength) {
    return <span>{text}</span>;
  }

  return (
    <div>
      {expanded ? text : text.substring(0, previewLength) + "..."}
      <button
        onClick={toggleExpanded}
        className="ml-2 text-blue-500 hover:underline"
      >
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
};
