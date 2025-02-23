import React from "react";

type BookContentProps = {
  content: string;
  onClose: () => void;
};

export default function BookContent({ content, onClose }: BookContentProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-6xl w-[90vw] max-h-[80vh] overflow-y-auto">
          <div className="whitespace-pre-wrap">
            {content || "No content available."}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-0 right-[-40px] translate-x-1/2 -translate-y-1/2 text-6xl text-gray-100 hover:text-gray-50"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
